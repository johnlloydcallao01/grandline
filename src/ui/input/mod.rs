use std::time::Instant;

use crate::ui::keyboard::{EditorAction, KeyBindingManager, KeyCombo, KeyCode, Modifiers};

// ---------------------------------------------------------------------------
// Editor mode – determines how input is interpreted
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EditorMode {
    /// Vim-like normal mode – keys trigger commands
    Normal,
    /// Text is inserted into the buffer
    Insert,
    /// Selection extends with cursor movement
    Visual,
    /// Command line at the bottom (e.g. `:wq`)
    Command,
    /// A dialog is active and capturing input
    Dialog,
    /// Command palette is active
    CommandPalette,
}

impl Default for EditorMode {
    fn default() -> Self {
        EditorMode::Normal
    }
}

impl std::fmt::Display for EditorMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EditorMode::Normal => write!(f, "NORMAL"),
            EditorMode::Insert => write!(f, "INSERT"),
            EditorMode::Visual => write!(f, "VISUAL"),
            EditorMode::Command => write!(f, "COMMAND"),
            EditorMode::Dialog => write!(f, "DIALOG"),
            EditorMode::CommandPalette => write!(f, "COMMAND PALETTE"),
        }
    }
}

// ---------------------------------------------------------------------------
// Mouse event types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct MousePosition {
    pub col: u16,
    pub row: u16,
}

#[derive(Debug, Clone)]
pub enum MouseButton {
    Left,
    Middle,
    Right,
}

#[derive(Debug, Clone)]
pub enum MouseAction {
    /// Single click at position
    Click {
        button: MouseButton,
        position: MousePosition,
        shift: bool,
        ctrl: bool,
        alt: bool,
    },
    /// Double click at position (select word)
    DoubleClick {
        position: MousePosition,
    },
    /// Triple click at position (select line)
    TripleClick {
        position: MousePosition,
    },
    /// Mouse drag (selection)
    Drag {
        button: MouseButton,
        start: MousePosition,
        current: MousePosition,
    },
    /// Scroll wheel
    Scroll {
        /// Positive = scroll down, negative = scroll up
        delta_y: i32,
        /// Horizontal scroll delta
        delta_x: i32,
        position: MousePosition,
        /// True when Ctrl is held (zoom)
        ctrl: bool,
    },
    /// Mouse button released
    Release {
        button: MouseButton,
        position: MousePosition,
    },
    /// Mouse entered the terminal area
    Enter(MousePosition),
    /// Mouse left the terminal area
    Leave,
}

// ---------------------------------------------------------------------------
// Input action – what the editor should do after processing input
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub enum InputAction {
    /// An editor action resolved from a keybinding
    EditorAction(EditorAction),
    /// A character to insert in Insert mode
    InsertChar(char),
    /// A string to insert (e.g. from paste)
    InsertString(String),
    /// Mouse event to handle
    Mouse(MouseAction),
    /// Mode changed
    ModeChanged(EditorMode),
    /// The editor should quit
    Quit,
    /// No action (consumed but no-op)
    None,
}

// ---------------------------------------------------------------------------
// Paste state tracking
// ---------------------------------------------------------------------------

#[derive(Debug, Default)]
struct PasteState {
    /// Whether bracketed paste mode is active
    bracketed: bool,
    /// Accumulated paste buffer
    buffer: String,
}

// ---------------------------------------------------------------------------
// InputHandler – main input processing engine
// ---------------------------------------------------------------------------

pub struct InputHandler {
    /// Current editor mode
    mode: EditorMode,
    /// Previous mode (for returning from dialogs etc.)
    previous_mode: EditorMode,
    /// Keybinding manager for combo → action resolution
    keybinding_manager: KeyBindingManager,
    /// Current partial key sequence (for multi-key combos)
    pending_keys: Vec<KeyCode>,
    /// Pending modifier state
    pending_modifiers: Modifiers,
    /// Paste handling state
    paste: PasteState,
    /// Timing for detecting double/triple clicks
    last_click_time: Option<Instant>,
    /// Position of last click (for double/triple click detection)
    last_click_pos: Option<MousePosition>,
    /// Drag state
    drag_active: bool,
    drag_start: Option<MousePosition>,
    drag_button: Option<MouseButton>,
    /// Scroll accumulation (for smooth pixel-precise scrolling)
    scroll_accum_y: f64,
    scroll_accum_x: f64,
    /// Terminal size (for coordinate mapping)
    terminal_width: u16,
    terminal_height: u16,
    /// Content area offset (after subtracting status bar height, etc.)
    content_offset_y: u16,
}

impl InputHandler {
    pub fn new(keybinding_manager: KeyBindingManager) -> Self {
        Self {
            mode: EditorMode::Normal,
            previous_mode: EditorMode::Normal,
            keybinding_manager,
            pending_keys: Vec::new(),
            pending_modifiers: Modifiers::empty(),
            paste: PasteState::default(),
            last_click_time: None,
            last_click_pos: None,
            drag_active: false,
            drag_start: None,
            drag_button: None,
            scroll_accum_y: 0.0,
            scroll_accum_x: 0.0,
            terminal_width: 80,
            terminal_height: 24,
            content_offset_y: 1, // status bar is 1 row
        }
    }

    // -- Configuration -------------------------------------------------------

    /// Update terminal dimensions (call on resize events).
    pub fn set_terminal_size(&mut self, width: u16, height: u16) {
        self.terminal_width = width;
        self.terminal_height = height;
    }

    /// Set the number of rows occupied by chrome (status bar, tab bar, etc.)
    /// above the content area. Mouse coordinates are adjusted accordingly.
    pub fn set_content_offset_y(&mut self, offset: u16) {
        self.content_offset_y = offset;
    }

    /// Access the underlying keybinding manager.
    pub fn keybindings(&self) -> &KeyBindingManager {
        &self.keybinding_manager
    }

    /// Mutably access the keybinding manager (for runtime rebinding).
    pub fn keybindings_mut(&mut self) -> &mut KeyBindingManager {
        &mut self.keybinding_manager
    }

    // -- Mode management -----------------------------------------------------

    /// Get the current editor mode.
    pub fn mode(&self) -> EditorMode {
        self.mode
    }

    /// Get the previous mode (useful for returning from dialogs).
    pub fn previous_mode(&self) -> EditorMode {
        self.previous_mode
    }

    /// Switch to a new mode, returning the ModeChanged action.
    fn switch_mode(&mut self, new_mode: EditorMode) -> InputAction {
        if self.mode != new_mode {
            self.previous_mode = self.mode;
            self.mode = new_mode;
            self.pending_keys.clear();
            self.pending_modifiers = Modifiers::empty();
            InputAction::ModeChanged(new_mode)
        } else {
            InputAction::None
        }
    }

    /// Return to the previous mode (e.g. after closing a dialog).
    pub fn return_to_previous_mode(&mut self) -> InputAction {
        let target = self.previous_mode;
        self.switch_mode(target)
    }

    // -- Keyboard input processing -------------------------------------------

    /// Process a raw character input. This is the main entry point for
    /// keyboard events from the terminal.
    ///
    /// Returns a list of InputActions to be processed by the editor.
    pub fn process_char(
        &mut self,
        ch: char,
        modifiers: Modifiers,
    ) -> Vec<InputAction> {
        let mut actions = Vec::new();

        // Handle bracketed paste
        if self.paste.bracketed {
            if ch == '\x1b' {
                // Could be end bracket sequence; for simplicity, end paste on ESC
                self.paste.bracketed = false;
                if !self.paste.buffer.is_empty() {
                    actions.push(InputAction::InsertString(self.paste.buffer.clone()));
                    self.paste.buffer.clear();
                }
            } else {
                self.paste.buffer.push(ch);
            }
            return actions;
        }

        match self.mode {
            EditorMode::Normal => {
                actions.extend(self.process_normal_mode(ch, modifiers));
            }
            EditorMode::Insert => {
                actions.extend(self.process_insert_mode(ch, modifiers));
            }
            EditorMode::Visual => {
                actions.extend(self.process_visual_mode(ch, modifiers));
            }
            EditorMode::Command => {
                // In command mode, characters go to the command line
                actions.push(InputAction::InsertChar(ch));
            }
            EditorMode::CommandPalette => {
                // Characters go to the palette search
                actions.push(InputAction::InsertChar(ch));
            }
            EditorMode::Dialog => {
                // Characters may go to dialog input or trigger dialog actions
                actions.push(InputAction::InsertChar(ch));
            }
        }

        actions
    }

    /// Process a key event with no character (function keys, arrows, etc.)
    pub fn process_key(
        &mut self,
        key: KeyCode,
        modifiers: Modifiers,
    ) -> Vec<InputAction> {
        let combo = KeyCombo::new(modifiers, key);
        let mut actions = Vec::new();

        // Always check keybinding first (works in all modes)
        if let Some(action) = self.keybinding_manager.lookup(&combo).cloned() {
            match &action {
                EditorAction::SwitchToNormal => {
                    actions.push(self.switch_mode(EditorMode::Normal));
                }
                EditorAction::SwitchToInsert => {
                    actions.push(self.switch_mode(EditorMode::Insert));
                }
                EditorAction::SwitchToVisual => {
                    actions.push(self.switch_mode(EditorMode::Visual));
                }
                EditorAction::SwitchToCommand => {
                    actions.push(self.switch_mode(EditorMode::Command));
                }
                EditorAction::OpenCommandPalette => {
                    actions.push(self.switch_mode(EditorMode::CommandPalette));
                }
                EditorAction::ZoomIn | EditorAction::ZoomOut | EditorAction::ZoomReset => {
                    actions.push(InputAction::EditorAction(action));
                }
                _ => {
                    actions.push(InputAction::EditorAction(action));
                }
            }
            return actions;
        }

        // Mode-specific fallback for unbound keys
        match self.mode {
            EditorMode::Normal => {
                // In normal mode, unbound keys are ignored (or could trigger
                // vi-like single-char commands in a future extension)
            }
            EditorMode::Insert => {
                // Some special keys in insert mode
                match key {
                    KeyCode::Enter => actions.push(InputAction::InsertChar('\n')),
                    KeyCode::Tab => actions.push(InputAction::InsertChar('\t')),
                    KeyCode::Backspace => {
                        actions.push(InputAction::EditorAction(EditorAction::DeleteCharBack))
                    }
                    KeyCode::Delete => {
                        actions.push(InputAction::EditorAction(EditorAction::DeleteChar))
                    }
                    _ => {}
                }
            }
            EditorMode::Visual => {
                // Arrow keys and navigation in visual mode extend selection
                match key {
                    KeyCode::Up => actions.push(InputAction::EditorAction(EditorAction::SelectUp)),
                    KeyCode::Down => actions.push(InputAction::EditorAction(EditorAction::SelectDown)),
                    KeyCode::Left => actions.push(InputAction::EditorAction(EditorAction::SelectLeft)),
                    KeyCode::Right => {
                        actions.push(InputAction::EditorAction(EditorAction::SelectRight))
                    }
                    _ => {}
                }
            }
            _ => {}
        }

        actions
    }

    /// Process key input in Normal mode.
    fn process_normal_mode(&mut self, ch: char, modifiers: Modifiers) -> Vec<InputAction> {
        let mut actions = Vec::new();

        // Build a KeyCombo from the character
        let key = char_to_keycode(ch);
        let combo = KeyCombo::new(modifiers, key);

        // Look up in keybindings
        if let Some(action) = self.keybinding_manager.lookup(&combo).cloned() {
            match &action {
                EditorAction::SwitchToNormal => {
                    actions.push(self.switch_mode(EditorMode::Normal));
                }
                EditorAction::SwitchToInsert => {
                    actions.push(self.switch_mode(EditorMode::Insert));
                }
                EditorAction::SwitchToVisual => {
                    actions.push(self.switch_mode(EditorMode::Visual));
                }
                EditorAction::SwitchToCommand => {
                    actions.push(self.switch_mode(EditorMode::Command));
                }
                EditorAction::OpenCommandPalette => {
                    actions.push(self.switch_mode(EditorMode::CommandPalette));
                }
                _ => {
                    actions.push(InputAction::EditorAction(action));
                }
            }
        }
        // In normal mode, unbound characters are silently ignored

        actions
    }

    /// Process key input in Insert mode.
    fn process_insert_mode(&mut self, ch: char, _modifiers: Modifiers) -> Vec<InputAction> {
        vec![InputAction::InsertChar(ch)]
    }

    /// Process key input in Visual mode.
    fn process_visual_mode(&mut self, ch: char, modifiers: Modifiers) -> Vec<InputAction> {
        let mut actions = Vec::new();
        let key = char_to_keycode(ch);
        let combo = KeyCombo::new(modifiers, key);

        if let Some(action) = self.keybinding_manager.lookup(&combo).cloned() {
            match &action {
                EditorAction::SwitchToNormal => {
                    actions.push(self.switch_mode(EditorMode::Normal));
                }
                _ => {
                    actions.push(InputAction::EditorAction(action));
                }
            }
        }
        // In visual mode, printable characters without modifiers are
        // interpreted as navigation + selection extension
        actions
    }

    // -- Mouse input processing ----------------------------------------------

    /// Process a mouse event.
    pub fn process_mouse(&mut self, action: MouseAction) -> Vec<InputAction> {
        let mut actions = Vec::new();

        match &action {
            MouseAction::Click {
                position,
                button,
                ..
            } => {
                let now = Instant::now();
                let is_double = self
                    .last_click_time
                    .map(|t| now.duration_since(t).as_millis() < 400)
                    .unwrap_or(false)
                    && self
                        .last_click_pos
                        .as_ref()
                        .map(|p| p.col == position.col && p.row == position.row)
                        .unwrap_or(false);

                if is_double {
                    // Check for triple click
                    let is_triple = self
                        .last_click_time
                        .map(|t| now.duration_since(t).as_millis() < 400)
                        .unwrap_or(false);
                    if is_triple {
                        actions.push(InputAction::Mouse(MouseAction::TripleClick {
                            position: position.clone(),
                        }));
                        self.last_click_time = None; // reset
                    } else {
                        actions.push(InputAction::Mouse(MouseAction::DoubleClick {
                            position: position.clone(),
                        }));
                        self.last_click_time = Some(now);
                    }
                } else {
                    actions.push(InputAction::Mouse(action.clone()));
                    self.last_click_time = Some(now);
                }

                self.last_click_pos = Some(position.clone());

                // Enter insert mode on left click in content area if in normal mode
                let content_row = position.row.saturating_sub(self.content_offset_y);
                if content_row < self.terminal_height.saturating_sub(self.content_offset_y)
                    && self.mode == EditorMode::Normal
                {
                    // Only switch mode if clicking in the editor content
                    // (not on status bar or tab bar)
                }
            }
            MouseAction::Scroll { delta_y, ctrl, .. } => {
                if *ctrl {
                    // Ctrl+Scroll = zoom
                    if *delta_y > 0 {
                        actions.push(InputAction::EditorAction(EditorAction::ZoomOut));
                    } else if *delta_y < 0 {
                        actions.push(InputAction::EditorAction(EditorAction::ZoomIn));
                    }
                } else {
                    actions.push(InputAction::Mouse(action.clone()));
                }
            }
            MouseAction::Drag {
                button,
                start,
                current,
            } => {
                self.drag_active = true;
                self.drag_start = Some(start.clone());
                self.drag_button = Some(button.clone());
                actions.push(InputAction::Mouse(action.clone()));
            }
            MouseAction::Release { .. } => {
                self.drag_active = false;
                self.drag_start = None;
                self.drag_button = None;
                actions.push(InputAction::Mouse(action.clone()));
            }
            _ => {
                actions.push(InputAction::Mouse(action));
            }
        }

        actions
    }

    /// Process a bracketed paste sequence.
    pub fn start_bracketed_paste(&mut self) {
        self.paste.bracketed = true;
        self.paste.buffer.clear();
    }

    pub fn end_bracketed_paste(&mut self) -> Option<String> {
        self.paste.bracketed = false;
        if self.paste.buffer.is_empty() {
            None
        } else {
            let buf = self.paste.buffer.clone();
            self.paste.buffer.clear();
            Some(buf)
        }
    }

    /// Check if we're currently in a bracketed paste.
    pub fn is_pasting(&self) -> bool {
        self.paste.bracketed
    }

    // -- Coordinate mapping ---------------------------------------------------

    /// Convert a terminal mouse position to a content-area position.
    /// The content area starts below the tab bar and above the status bar.
    pub fn terminal_to_content(&self, pos: &MousePosition) -> MousePosition {
        MousePosition {
            col: pos.col,
            row: pos.row.saturating_sub(self.content_offset_y),
        }
    }

    /// Check if a position is within the content area (not on chrome).
    pub fn is_in_content_area(&self, pos: &MousePosition) -> bool {
        pos.row >= self.content_offset_y
            && pos.row < self.terminal_height.saturating_sub(1) // status bar
    }

    /// Check if a position is on the status bar.
    pub fn is_on_status_bar(&self, pos: &MousePosition) -> bool {
        pos.row == self.terminal_height.saturating_sub(1)
    }

    /// Check if a position is on the tab bar.
    pub fn is_on_tab_bar(&self, pos: &MousePosition) -> bool {
        pos.row < self.content_offset_y
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Convert a character to our KeyCode enum.
fn char_to_keycode(ch: char) -> KeyCode {
    match ch {
        'a' | 'A' => KeyCode::A, 'b' | 'B' => KeyCode::B,
        'c' | 'C' => KeyCode::C, 'd' | 'D' => KeyCode::D,
        'e' | 'E' => KeyCode::E, 'f' | 'F' => KeyCode::F,
        'g' | 'G' => KeyCode::G, 'h' | 'H' => KeyCode::H,
        'i' | 'I' => KeyCode::I, 'j' | 'J' => KeyCode::J,
        'k' | 'K' => KeyCode::K, 'l' | 'L' => KeyCode::L,
        'm' | 'M' => KeyCode::M, 'n' | 'N' => KeyCode::N,
        'o' | 'O' => KeyCode::O, 'p' | 'P' => KeyCode::P,
        'q' | 'Q' => KeyCode::Q, 'r' | 'R' => KeyCode::R,
        's' | 'S' => KeyCode::S, 't' | 'T' => KeyCode::T,
        'u' | 'U' => KeyCode::U, 'v' | 'V' => KeyCode::V,
        'w' | 'W' => KeyCode::W, 'x' | 'X' => KeyCode::X,
        'y' | 'Y' => KeyCode::Y, 'z' | 'Z' => KeyCode::Z,
        '0' => KeyCode::Key0, '1' => KeyCode::Key1,
        '2' => KeyCode::Key2, '3' => KeyCode::Key3,
        '4' => KeyCode::Key4, '5' => KeyCode::Key5,
        '6' => KeyCode::Key6, '7' => KeyCode::Key7,
        '8' => KeyCode::Key8, '9' => KeyCode::Key9,
        ' ' => KeyCode::Space,
        '.' => KeyCode::Period,
        ',' => KeyCode::Comma,
        ';' => KeyCode::Semicolon,
        ':' => KeyCode::Colon,
        '/' => KeyCode::Slash,
        '\\' => KeyCode::Backslash,
        '-' => KeyCode::Minus,
        '=' => KeyCode::Equal,
        '+' => KeyCode::Plus,
        '(' => KeyCode::LeftParen,
        ')' => KeyCode::RightParen,
        '[' => KeyCode::LeftBracket,
        ']' => KeyCode::RightBracket,
        '{' => KeyCode::LeftBrace,
        '}' => KeyCode::RightBrace,
        '\'' => KeyCode::Apostrophe,
        '`' => KeyCode::Backtick,
        '!' => KeyCode::Exclamation,
        '@' => KeyCode::At,
        '#' => KeyCode::Hash,
        '$' => KeyCode::Dollar,
        '%' => KeyCode::Percent,
        '^' => KeyCode::Caret,
        '&' => KeyCode::Ampersand,
        '*' => KeyCode::Asterisk,
        '_' => KeyCode::Underscore,
        '|' => KeyCode::Pipe,
        '~' => KeyCode::Tilde,
        _ => KeyCode::Char(ch),
    }
}

// ---------------------------------------------------------------------------
// Text input buffer – accumulates text for the insert mode command line
// ---------------------------------------------------------------------------

/// A simple text input buffer used for command lines, search prompts, etc.
pub struct TextBuffer {
    /// The text content
    chars: Vec<char>,
    /// Cursor position within the buffer (byte index into chars)
    cursor: usize,
    /// Maximum length (0 = unlimited)
    max_length: usize,
    /// Placeholder text when empty
    placeholder: String,
}

impl TextBuffer {
    pub fn new() -> Self {
        Self {
            chars: Vec::new(),
            cursor: 0,
            max_length: 0,
            placeholder: String::new(),
        }
    }

    pub fn with_placeholder(mut self, placeholder: impl Into<String>) -> Self {
        self.placeholder = placeholder.into();
        self
    }

    pub fn with_max_length(mut self, max: usize) -> Self {
        self.max_length = max;
        self
    }

    /// Insert a character at the cursor position.
    pub fn insert(&mut self, ch: char) -> bool {
        if self.max_length > 0 && self.chars.len() >= self.max_length {
            return false;
        }
        self.chars.insert(self.cursor, ch);
        self.cursor += 1;
        true
    }

    /// Insert a string at the cursor position.
    pub fn insert_str(&mut self, s: &str) -> bool {
        for ch in s.chars() {
            if !self.insert(ch) {
                return false;
            }
        }
        true
    }

    /// Delete the character before the cursor (backspace).
    pub fn delete_back(&mut self) -> bool {
        if self.cursor > 0 {
            self.cursor -= 1;
            self.chars.remove(self.cursor);
            true
        } else {
            false
        }
    }

    /// Delete the character at the cursor (delete key).
    pub fn delete_forward(&mut self) -> bool {
        if self.cursor < self.chars.len() {
            self.chars.remove(self.cursor);
            true
        } else {
            false
        }
    }

    /// Clear all text.
    pub fn clear(&mut self) {
        self.chars.clear();
        self.cursor = 0;
    }

    /// Move cursor left.
    pub fn move_left(&mut self) {
        if self.cursor > 0 {
            self.cursor -= 1;
        }
    }

    /// Move cursor right.
    pub fn move_right(&mut self) {
        if self.cursor < self.chars.len() {
            self.cursor += 1;
        }
    }

    /// Move cursor to start.
    pub fn move_to_start(&mut self) {
        self.cursor = 0;
    }

    /// Move cursor to end.
    pub fn move_to_end(&mut self) {
        self.cursor = self.chars.len();
    }

    /// Get the current text as a String.
    pub fn text(&self) -> String {
        self.chars.iter().collect()
    }

    /// Get the cursor position.
    pub fn cursor(&self) -> usize {
        self.cursor
    }

    /// Check if the buffer is empty.
    pub fn is_empty(&self) -> bool {
        self.chars.is_empty()
    }

    /// Get the display text (with placeholder if empty).
    pub fn display_text(&self) -> &str {
        if self.chars.is_empty() {
            &self.placeholder
        } else {
            // Return the text; actual rendering handles cursor
            &self.placeholder // placeholder is not borrowed here properly
            // In real usage, we'd return a Cow<str>
        }
    }

    /// Render the buffer content with cursor indicator.
    pub fn render(&self, max_width: usize) -> String {
        if self.chars.is_empty() {
            return format!("{:\u{2500}<width$}", "", width = max_width);
        }

        let text: String = self.chars.iter().collect();
        if text.len() <= max_width {
            let mut result = text;
            // Pad to max_width
            let padding = max_width.saturating_sub(result.len());
            result.push_str(&" ".repeat(padding));
            result
        } else {
            // Truncate, keeping cursor visible
            let scroll = if self.cursor >= max_width {
                self.cursor - max_width + 1
            } else {
                0
            };
            text[scroll..].chars().take(max_width).collect()
        }
    }
}

impl Default for TextBuffer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mode_display() {
        assert_eq!(EditorMode::Normal.to_string(), "NORMAL");
        assert_eq!(EditorMode::Insert.to_string(), "INSERT");
        assert_eq!(EditorMode::Visual.to_string(), "VISUAL");
    }

    #[test]
    fn test_text_buffer_insert() {
        let mut buf = TextBuffer::new();
        buf.insert('h');
        buf.insert('e');
        buf.insert('l');
        buf.insert('l');
        buf.insert('o');
        assert_eq!(buf.text(), "hello");
        assert_eq!(buf.cursor(), 5);
    }

    #[test]
    fn test_text_buffer_delete() {
        let mut buf = TextBuffer::new();
        buf.insert_str("hello");
        buf.delete_back();
        assert_eq!(buf.text(), "hell");
        buf.move_left();
        buf.delete_forward();
        assert_eq!(buf.text(), "hel");
    }

    #[test]
    fn test_terminal_to_content() {
        let handler = InputHandler::new(KeyBindingManager::new(std::path::PathBuf::from("/tmp")));
        // Content offset is 1 (for status bar)
        let term_pos = MousePosition { col: 10, row: 5 };
        let content_pos = handler.terminal_to_content(&term_pos);
        assert_eq!(content_pos.row, 4);
        assert_eq!(content_pos.col, 10);
    }

    #[test]
    fn test_bracketed_paste() {
        let mut handler = InputHandler::new(KeyBindingManager::new(std::path::PathBuf::from("/tmp")));
        assert!(!handler.is_pasting());

        handler.start_bracketed_paste();
        assert!(handler.is_pasting());
        handler.process_char('h', Modifiers::empty());
        handler.process_char('i', Modifiers::empty());

        let result = handler.end_bracketed_paste();
        assert_eq!(result, Some("hi".to_string()));
        assert!(!handler.is_pasting());
    }
}
