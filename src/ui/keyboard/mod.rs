use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Modifier keys
// ---------------------------------------------------------------------------

bitflags::bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
    pub struct Modifiers: u8 {
        const CTRL  = 0b0001;
        const ALT   = 0b0010;
        const SHIFT = 0b0100;
        const META  = 0b1000;
    }
}

impl Default for Modifiers {
    fn default() -> Self {
        Modifiers::empty()
    }
}

impl Modifiers {
    pub fn is_empty(self) -> bool {
        self.bits() == 0
    }

    pub fn from_str(s: &str) -> Self {
        let mut mods = Modifiers::empty();
        for part in s.split('+') {
            match part.trim().to_lowercase().as_str() {
                "ctrl" | "control" => mods |= Modifiers::CTRL,
                "alt" | "option" => mods |= Modifiers::ALT,
                "shift" => mods |= Modifiers::SHIFT,
                "meta" | "cmd" | "super" | "win" => mods |= Modifiers::META,
                _ => {}
            }
        }
        mods
    }
}

impl std::fmt::Display for Modifiers {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut parts = Vec::new();
        if self.contains(Modifiers::CTRL) {
            parts.push("Ctrl");
        }
        if self.contains(Modifiers::ALT) {
            parts.push("Alt");
        }
        if self.contains(Modifiers::SHIFT) {
            parts.push("Shift");
        }
        if self.contains(Modifiers::META) {
            parts.push("Meta");
        }
        write!(f, "{}", parts.join("+"))
    }
}

// ---------------------------------------------------------------------------
// Key code – abstract representation of a physical key
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum KeyCode {
    // Letters
    A, B, C, D, E, F, G, H, I, J, K, L, M,
    N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
    // Digits
    Key0, Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9,
    // Function keys
    F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,
    // Navigation / editing
    Escape, Enter, Tab, Backspace, Delete, Insert,
    Home, End, PageUp, PageDown,
    Up, Down, Left, Right,
    Space,
    // Punctuation / symbols (common ones)
    Period, Comma, Semicolon, Colon,
    Slash, Backslash,
    Minus, Equal, Plus,
    LeftParen, RightParen,
    LeftBracket, RightBracket,
    LeftBrace, RightBrace,
    Apostrophe, Backtick,
    Exclamation, At, Hash, Dollar, Percent, Caret, Ampersand, Asterisk,
    Underscore, Pipe, Tilde, Quote,
    // Catch-all for printable characters
    Char(char),
}

impl KeyCode {
    /// Parse a single key name string into a KeyCode.
    pub fn from_str(s: &str) -> Option<Self> {
        match s.trim().to_lowercase().as_str() {
            "a" => Some(KeyCode::A), "b" => Some(KeyCode::B),
            "c" => Some(KeyCode::C), "d" => Some(KeyCode::D),
            "e" => Some(KeyCode::E), "f" => Some(KeyCode::F),
            "g" => Some(KeyCode::G), "h" => Some(KeyCode::H),
            "i" => Some(KeyCode::I), "j" => Some(KeyCode::J),
            "k" => Some(KeyCode::K), "l" => Some(KeyCode::L),
            "m" => Some(KeyCode::M), "n" => Some(KeyCode::N),
            "o" => Some(KeyCode::O), "p" => Some(KeyCode::P),
            "q" => Some(KeyCode::Q), "r" => Some(KeyCode::R),
            "s" => Some(KeyCode::S), "t" => Some(KeyCode::T),
            "u" => Some(KeyCode::U), "v" => Some(KeyCode::V),
            "w" => Some(KeyCode::W), "x" => Some(KeyCode::X),
            "y" => Some(KeyCode::Y), "z" => Some(KeyCode::Z),
            "0" => Some(KeyCode::Key0), "1" => Some(KeyCode::Key1),
            "2" => Some(KeyCode::Key2), "3" => Some(KeyCode::Key3),
            "4" => Some(KeyCode::Key4), "5" => Some(KeyCode::Key5),
            "6" => Some(KeyCode::Key6), "7" => Some(KeyCode::Key7),
            "8" => Some(KeyCode::Key8), "9" => Some(KeyCode::Key9),
            "f1" => Some(KeyCode::F1), "f2" => Some(KeyCode::F2),
            "f3" => Some(KeyCode::F3), "f4" => Some(KeyCode::F4),
            "f5" => Some(KeyCode::F5), "f6" => Some(KeyCode::F6),
            "f7" => Some(KeyCode::F7), "f8" => Some(KeyCode::F8),
            "f9" => Some(KeyCode::F9), "f10" => Some(KeyCode::F10),
            "f11" => Some(KeyCode::F11), "f12" => Some(KeyCode::F12),
            "escape" | "esc" => Some(KeyCode::Escape),
            "enter" | "return" => Some(KeyCode::Enter),
            "tab" => Some(KeyCode::Tab),
            "backspace" | "bs" => Some(KeyCode::Backspace),
            "delete" | "del" => Some(KeyCode::Delete),
            "insert" | "ins" => Some(KeyCode::Insert),
            "home" => Some(KeyCode::Home),
            "end" => Some(KeyCode::End),
            "pageup" | "pgup" => Some(KeyCode::PageUp),
            "pagedown" | "pgdn" | "pgdown" => Some(KeyCode::PageDown),
            "up" | "arrowup" => Some(KeyCode::Up),
            "down" | "arrowdown" => Some(KeyCode::Down),
            "left" | "arrowleft" => Some(KeyCode::Left),
            "right" | "arrowright" => Some(KeyCode::Right),
            "space" | " " => Some(KeyCode::Space),
            "." => Some(KeyCode::Period),
            "," => Some(KeyCode::Comma),
            ";" => Some(KeyCode::Semicolon),
            ":" => Some(KeyCode::Colon),
            "/" => Some(KeyCode::Slash),
            "\\" => Some(KeyCode::Backslash),
            "-" => Some(KeyCode::Minus),
            "=" => Some(KeyCode::Equal),
            "+" => Some(KeyCode::Plus),
            "(" => Some(KeyCode::LeftParen),
            ")" => Some(KeyCode::RightParen),
            "[" => Some(KeyCode::LeftBracket),
            "]" => Some(KeyCode::RightBracket),
            "{" => Some(KeyCode::LeftBrace),
            "}" => Some(KeyCode::RightBrace),
            "'" => Some(KeyCode::Apostrophe),
            "`" => Some(KeyCode::Backtick),
            "!" => Some(KeyCode::Exclamation),
            "@" => Some(KeyCode::At),
            "#" => Some(KeyCode::Hash),
            "$" => Some(KeyCode::Dollar),
            "%" => Some(KeyCode::Percent),
            "^" => Some(KeyCode::Caret),
            "&" => Some(KeyCode::Ampersand),
            "*" => Some(KeyCode::Asterisk),
            "_" => Some(KeyCode::Underscore),
            "|" => Some(KeyCode::Pipe),
            "~" => Some(KeyCode::Tilde),
            _ if s.len() == 1 => s.chars().next().map(KeyCode::Char),
            _ => None,
        }
    }

    /// Convert a KeyCode to its display string.
    pub fn as_str(&self) -> String {
        match self {
            KeyCode::A => "a".into(), KeyCode::B => "b".into(),
            KeyCode::C => "c".into(), KeyCode::D => "d".into(),
            KeyCode::E => "e".into(), KeyCode::F => "f".into(),
            KeyCode::G => "g".into(), KeyCode::H => "h".into(),
            KeyCode::I => "i".into(), KeyCode::J => "j".into(),
            KeyCode::K => "k".into(), KeyCode::L => "l".into(),
            KeyCode::M => "m".into(), KeyCode::N => "n".into(),
            KeyCode::O => "o".into(), KeyCode::P => "p".into(),
            KeyCode::Q => "q".into(), KeyCode::R => "r".into(),
            KeyCode::S => "s".into(), KeyCode::T => "t".into(),
            KeyCode::U => "u".into(), KeyCode::V => "v".into(),
            KeyCode::W => "w".into(), KeyCode::X => "x".into(),
            KeyCode::Y => "y".into(), KeyCode::Z => "z".into(),
            KeyCode::Key0 => "0".into(), KeyCode::Key1 => "1".into(),
            KeyCode::Key2 => "2".into(), KeyCode::Key3 => "3".into(),
            KeyCode::Key4 => "4".into(), KeyCode::Key5 => "5".into(),
            KeyCode::Key6 => "6".into(), KeyCode::Key7 => "7".into(),
            KeyCode::Key8 => "8".into(), KeyCode::Key9 => "9".into(),
            KeyCode::F1 => "F1".into(), KeyCode::F2 => "F2".into(),
            KeyCode::F3 => "F3".into(), KeyCode::F4 => "F4".into(),
            KeyCode::F5 => "F5".into(), KeyCode::F6 => "F6".into(),
            KeyCode::F7 => "F7".into(), KeyCode::F8 => "F8".into(),
            KeyCode::F9 => "F9".into(), KeyCode::F10 => "F10".into(),
            KeyCode::F11 => "F11".into(), KeyCode::F12 => "F12".into(),
            KeyCode::Escape => "Esc".into(),
            KeyCode::Enter => "Enter".into(),
            KeyCode::Tab => "Tab".into(),
            KeyCode::Backspace => "BS".into(),
            KeyCode::Delete => "Del".into(),
            KeyCode::Insert => "Ins".into(),
            KeyCode::Home => "Home".into(),
            KeyCode::End => "End".into(),
            KeyCode::PageUp => "PgUp".into(),
            KeyCode::PageDown => "PgDn".into(),
            KeyCode::Up => "Up".into(),
            KeyCode::Down => "Down".into(),
            KeyCode::Left => "Left".into(),
            KeyCode::Right => "Right".into(),
            KeyCode::Space => "Space".into(),
            KeyCode::Period => ".".into(),
            KeyCode::Comma => ",".into(),
            KeyCode::Semicolon => ";".into(),
            KeyCode::Colon => ":".into(),
            KeyCode::Slash => "/".into(),
            KeyCode::Backslash => "\\".into(),
            KeyCode::Minus => "-".into(),
            KeyCode::Equal => "=".into(),
            KeyCode::Plus => "+".into(),
            KeyCode::LeftParen => "(".into(),
            KeyCode::RightParen => ")".into(),
            KeyCode::LeftBracket => "[".into(),
            KeyCode::RightBracket => "]".into(),
            KeyCode::LeftBrace => "{".into(),
            KeyCode::RightBrace => "}".into(),
            KeyCode::Apostrophe => "'".into(),
            KeyCode::Backtick => "`".into(),
            KeyCode::Exclamation => "!".into(),
            KeyCode::At => "@".into(),
            KeyCode::Hash => "#".into(),
            KeyCode::Dollar => "$".into(),
            KeyCode::Percent => "%".into(),
            KeyCode::Caret => "^".into(),
            KeyCode::Ampersand => "&".into(),
            KeyCode::Asterisk => "*".into(),
            KeyCode::Underscore => "_".into(),
            KeyCode::Pipe => "|".into(),
            KeyCode::Tilde => "~".into(),
            KeyCode::Quote => "'".into(),
            KeyCode::Char(c) => c.to_string(),
        }
    }
}

// ---------------------------------------------------------------------------
// KeyCombo – a modifier set + key
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct KeyCombo {
    pub modifiers: Modifiers,
    pub key: KeyCode,
}

impl KeyCombo {
    pub fn new(modifiers: Modifiers, key: KeyCode) -> Self {
        Self { modifiers, key }
    }

    /// Parse a combo string like "Ctrl+Shift+P" or "Ctrl+S".
    pub fn parse(s: &str) -> Option<Self> {
        let parts: Vec<&str> = s.split('+').collect();
        if parts.is_empty() {
            return None;
        }
        let (key_part, mod_parts) = parts.split_last()?;
        let modifiers = Modifiers::from_str(&mod_parts.join("+"));
        let key = KeyCode::from_str(key_part)?;
        Some(KeyCombo { modifiers, key })
    }
}

impl std::fmt::Display for KeyCombo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if !self.modifiers.is_empty() {
            write!(f, "{}+{}", self.modifiers, self.key.as_str())
        } else {
            write!(f, "{}", self.key.as_str())
        }
    }
}

// ---------------------------------------------------------------------------
// Editor action – all possible commands that keybindings can trigger
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EditorAction {
    // Mode switching
    SwitchToNormal,
    SwitchToInsert,
    SwitchToVisual,
    SwitchToCommand,

    // Command palette
    OpenCommandPalette,

    // File operations
    Save,
    SaveAs,
    OpenFile,
    CloseFile,
    NewFile,

    // Navigation
    CursorUp,
    CursorDown,
    CursorLeft,
    CursorRight,
    CursorWordForward,
    CursorWordBackward,
    CursorLineStart,
    CursorLineEnd,
    CursorDocStart,
    CursorDocEnd,
    PageUp,
    PageDown,

    // Selection
    SelectUp,
    SelectDown,
    SelectLeft,
    SelectRight,
    SelectAll,
    SelectLine,

    // Editing
    InsertChar(char),
    DeleteChar,
    DeleteCharBack,
    DeleteLine,
    DuplicateLine,
    Indent,
    Dedent,
    Undo,
    Redo,
    Copy,
    Cut,
    Paste,

    // Search
    Find,
    FindNext,
    FindPrevious,
    Replace,

    // View
    ZoomIn,
    ZoomOut,
    ZoomReset,
    ToggleWordWrap,
    ToggleMinimap,
    ToggleLineNumbers,
    ToggleTerminal,

    // Panels
    SplitHorizontal,
    SplitVertical,
    ClosePanel,
    NextPanel,
    PreviousPanel,

    // Tabs
    NextTab,
    PreviousTab,
    CloseTab,
    PinTab,

    // Go to
    GoToLine,

    // Generic (for custom user-defined actions)
    Custom(String),
}

// ---------------------------------------------------------------------------
// Key binding – maps a KeyCombo to an EditorAction
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyBinding {
    pub combo: KeyCombo,
    pub action: EditorAction,
    #[serde(default)]
    pub description: String,
}

// ---------------------------------------------------------------------------
// KeyMap – persisted collection of keybindings
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyMap {
    pub bindings: Vec<KeyBinding>,
    #[serde(default = "default_keymap_name")]
    pub name: String,
}

fn default_keymap_name() -> String {
    "default".to_string()
}

impl Default for KeyMap {
    fn default() -> Self {
        Self {
            bindings: Self::default_bindings(),
            name: "default".to_string(),
        }
    }
}

impl KeyMap {
    /// Returns the built-in default keybindings.
    pub fn default_bindings() -> Vec<KeyBinding> {
        vec![
            // Mode switching
            KeyBinding {
                combo: KeyCombo::parse("Escape").unwrap(),
                action: EditorAction::SwitchToNormal,
                description: "Switch to Normal mode".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("i").unwrap(),
                action: EditorAction::SwitchToInsert,
                description: "Switch to Insert mode".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("v").unwrap(),
                action: EditorAction::SwitchToVisual,
                description: "Switch to Visual mode".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse(":").unwrap(),
                action: EditorAction::SwitchToCommand,
                description: "Switch to Command mode".into(),
            },

            // Command palette
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Shift+P").unwrap(),
                action: EditorAction::OpenCommandPalette,
                description: "Open Command Palette".into(),
            },

            // File operations
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+S").unwrap(),
                action: EditorAction::Save,
                description: "Save file".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Shift+S").unwrap(),
                action: EditorAction::SaveAs,
                description: "Save file as".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+O").unwrap(),
                action: EditorAction::OpenFile,
                description: "Open file".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+W").unwrap(),
                action: EditorAction::CloseFile,
                description: "Close file".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+N").unwrap(),
                action: EditorAction::NewFile,
                description: "New file".into(),
            },

            // Navigation
            KeyBinding {
                combo: KeyCombo::parse("Up").unwrap(),
                action: EditorAction::CursorUp,
                description: "Move cursor up".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Down").unwrap(),
                action: EditorAction::CursorDown,
                description: "Move cursor down".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Left").unwrap(),
                action: EditorAction::CursorLeft,
                description: "Move cursor left".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Right").unwrap(),
                action: EditorAction::CursorRight,
                description: "Move cursor right".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Left").unwrap(),
                action: EditorAction::CursorWordBackward,
                description: "Move cursor word backward".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Right").unwrap(),
                action: EditorAction::CursorWordForward,
                description: "Move cursor word forward".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Home").unwrap(),
                action: EditorAction::CursorLineStart,
                description: "Move to line start".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("End").unwrap(),
                action: EditorAction::CursorLineEnd,
                description: "Move to line end".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Home").unwrap(),
                action: EditorAction::CursorDocStart,
                description: "Move to document start".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+End").unwrap(),
                action: EditorAction::CursorDocEnd,
                description: "Move to document end".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("PageUp").unwrap(),
                action: EditorAction::PageUp,
                description: "Page up".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("PageDown").unwrap(),
                action: EditorAction::PageDown,
                description: "Page down".into(),
            },

            // Selection
            KeyBinding {
                combo: KeyCombo::parse("Shift+Up").unwrap(),
                action: EditorAction::SelectUp,
                description: "Select up".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Shift+Down").unwrap(),
                action: EditorAction::SelectDown,
                description: "Select down".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Shift+Left").unwrap(),
                action: EditorAction::SelectLeft,
                description: "Select left".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Shift+Right").unwrap(),
                action: EditorAction::SelectRight,
                description: "Select right".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+A").unwrap(),
                action: EditorAction::SelectAll,
                description: "Select all".into(),
            },

            // Editing
            KeyBinding {
                combo: KeyCombo::parse("Backspace").unwrap(),
                action: EditorAction::DeleteCharBack,
                description: "Delete character backward".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Delete").unwrap(),
                action: EditorAction::DeleteChar,
                description: "Delete character forward".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+D").unwrap(),
                action: EditorAction::DuplicateLine,
                description: "Duplicate line".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Tab").unwrap(),
                action: EditorAction::Indent,
                description: "Indent".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Shift+Tab").unwrap(),
                action: EditorAction::Dedent,
                description: "Dedent".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Z").unwrap(),
                action: EditorAction::Undo,
                description: "Undo".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Shift+Z").unwrap(),
                action: EditorAction::Redo,
                description: "Redo".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+C").unwrap(),
                action: EditorAction::Copy,
                description: "Copy".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+X").unwrap(),
                action: EditorAction::Cut,
                description: "Cut".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+V").unwrap(),
                action: EditorAction::Paste,
                description: "Paste".into(),
            },

            // Search
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+F").unwrap(),
                action: EditorAction::Find,
                description: "Find".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("F3").unwrap(),
                action: EditorAction::FindNext,
                description: "Find next".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Shift+F3").unwrap(),
                action: EditorAction::FindPrevious,
                description: "Find previous".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+H").unwrap(),
                action: EditorAction::Replace,
                description: "Find and replace".into(),
            },

            // View
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Equal").unwrap(),
                action: EditorAction::ZoomIn,
                description: "Zoom in".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Minus").unwrap(),
                action: EditorAction::ZoomOut,
                description: "Zoom out".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+0").unwrap(),
                action: EditorAction::ZoomReset,
                description: "Reset zoom".into(),
            },

            // Panels
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+\\").unwrap(),
                action: EditorAction::SplitVertical,
                description: "Split panel vertically".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Shift+\\").unwrap(),
                action: EditorAction::SplitHorizontal,
                description: "Split panel horizontally".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+W").unwrap(),
                action: EditorAction::ClosePanel,
                description: "Close panel".into(),
            },

            // Tabs
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Tab").unwrap(),
                action: EditorAction::NextTab,
                description: "Next tab".into(),
            },
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+Shift+Tab").unwrap(),
                action: EditorAction::PreviousTab,
                description: "Previous tab".into(),
            },

            // Go to line
            KeyBinding {
                combo: KeyCombo::parse("Ctrl+G").unwrap(),
                action: EditorAction::GoToLine,
                description: "Go to line".into(),
            },
        ]
    }

    /// Load a keymap from a JSON file. Falls back to defaults on error.
    pub fn load(path: &PathBuf) -> Self {
        match fs::read_to_string(path) {
            Ok(content) => {
                serde_json::from_str(&content).unwrap_or_else(|e| {
                    eprintln!("Failed to parse keymap: {}, using defaults", e);
                    Self::default()
                })
            }
            Err(_) => Self::default(),
        }
    }

    /// Save the keymap to a JSON file.
    pub fn save(&self, path: &PathBuf) -> std::io::Result<()> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)
    }
}

// ---------------------------------------------------------------------------
// KeyBindingManager – runtime lookup and dispatch
// ---------------------------------------------------------------------------

pub struct KeyBindingManager {
    /// Active keymap
    keymap: KeyMap,
    /// Overlay bindings (user overrides, checked first)
    overlays: Vec<KeyBinding>,
    /// Config directory for persistence
    config_dir: PathBuf,
}

impl KeyBindingManager {
    pub fn new(config_dir: PathBuf) -> Self {
        let keymap_path = config_dir.join("keybindings.json");
        let keymap = KeyMap::load(&keymap_path);
        Self {
            keymap,
            overlays: Vec::new(),
            config_dir,
        }
    }

    /// Look up an action for a key combo. Overlays are checked first, then
    /// the active keymap. Returns None if no binding matches.
    pub fn lookup(&self, combo: &KeyCombo) -> Option<&EditorAction> {
        // Check overlays first (most-recently-added wins)
        for binding in self.overlays.iter().rev() {
            if binding.combo == *combo {
                return Some(&binding.action);
            }
        }
        // Then check the keymap
        self.keymap.bindings.iter().find(|b| b.combo == *combo).map(|b| &b.action)
    }

    /// Add or override a binding at runtime.
    pub fn register(&mut self, combo: KeyCombo, action: EditorAction, description: String) {
        // Remove any existing binding for this combo in overlays
        self.overlays.retain(|b| b.combo != combo);
        self.overlays.push(KeyBinding {
            combo,
            action,
            description,
        });
    }

    /// Remove a binding override (reverts to keymap default).
    pub fn unregister(&mut self, combo: &KeyCombo) {
        self.overlays.retain(|b| b.combo != *combo);
    }

    /// Persist current overlays merged with the keymap to disk.
    pub fn save(&self) -> std::io::Result<()> {
        let mut merged = self.keymap.clone();
        for overlay in &self.overlays {
            merged.bindings.retain(|b| b.combo != overlay.combo);
            merged.bindings.push(overlay.clone());
        }
        let keymap_path = self.config_dir.join("keybindings.json");
        merged.save(&keymap_path)
    }

    /// Reload the keymap from disk (clears overlays).
    pub fn reload(&mut self) {
        let keymap_path = self.config_dir.join("keybindings.json");
        self.keymap = KeyMap::load(&keymap_path);
        self.overlays.clear();
    }

    /// Get a reference to all active bindings (overlays + keymap, deduplicated).
    pub fn all_bindings(&self) -> Vec<KeyBinding> {
        let mut map: HashMap<KeyCombo, &KeyBinding> = HashMap::new();
        for b in &self.keymap.bindings {
            map.insert(b.combo.clone(), b);
        }
        for b in &self.overlays {
            map.insert(b.combo.clone(), b);
        }
        map.into_values().cloned().collect()
    }

    /// Get the description for a combo (useful for UI hints).
    pub fn describe(&self, combo: &KeyCombo) -> Option<String> {
        self.lookup(combo).map(|action| {
            // Try to find a binding with a description
            for b in &self.keymap.bindings {
                if b.combo == *combo && !b.description.is_empty() {
                    return b.description.clone();
                }
            }
            for b in &self.overlays {
                if b.combo == *combo && !b.description.is_empty() {
                    return b.description.clone();
                }
            }
            format!("{:?}", action)
        })
    }
}

// ---------------------------------------------------------------------------
// Key combo matching helper for terminal crossterm events
// ---------------------------------------------------------------------------

/// Convert a crossterm::event::KeyEvent into our KeyCombo representation.
/// This bridges the gap between terminal input and our abstract key model.
#[cfg(feature = "term-input")]
pub fn key_event_to_combo(event: &crossterm::event::KeyEvent) -> KeyCombo {
    use crossterm::event::{KeyModifiers, KeyCode as CKeyCode};

    let mut modifiers = Modifiers::empty();
    if event.modifiers.contains(KeyModifiers::CONTROL) {
        modifiers |= Modifiers::CTRL;
    }
    if event.modifiers.contains(KeyModifiers::ALT) {
        modifiers |= Modifiers::ALT;
    }
    if event.modifiers.contains(KeyModifiers::SHIFT) {
        modifiers |= Modifiers::SHIFT;
    }

    let key = match event.code {
        CKeyCode::Esc => KeyCode::Escape,
        CKeyCode::Enter => KeyCode::Enter,
        CKeyCode::Tab => KeyCode::Tab,
        CKeyCode::Backspace => KeyCode::Backspace,
        CKeyCode::Delete => KeyCode::Delete,
        CKeyCode::Insert => KeyCode::Insert,
        CKeyCode::Home => KeyCode::Home,
        CKeyCode::End => KeyCode::End,
        CKeyCode::PageUp => KeyCode::PageUp,
        CKeyCode::PageDown => KeyCode::PageDown,
        CKeyCode::Up => KeyCode::Up,
        CKeyCode::Down => KeyCode::Down,
        CKeyCode::Left => KeyCode::Left,
        CKeyCode::Right => KeyCode::Right,
        CKeyCode::F(n) => match n {
            1 => KeyCode::F1, 2 => KeyCode::F2, 3 => KeyCode::F3, 4 => KeyCode::F4,
            5 => KeyCode::F5, 6 => KeyCode::F6, 7 => KeyCode::F7, 8 => KeyCode::F8,
            9 => KeyCode::F9, 10 => KeyCode::F10, 11 => KeyCode::F11, 12 => KeyCode::F12,
            _ => KeyCode::Char('?'),
        },
        CKeyCode::Char(c) => KeyCode::Char(c),
        _ => KeyCode::Char('?'),
    };

    KeyCombo { modifiers, key }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_combo_parse() {
        let combo = KeyCombo::parse("Ctrl+Shift+P").unwrap();
        assert!(combo.modifiers.contains(Modifiers::CTRL));
        assert!(combo.modifiers.contains(Modifiers::SHIFT));
        assert_eq!(combo.key, KeyCode::P);
    }

    #[test]
    fn test_combo_parse_simple() {
        let combo = KeyCombo::parse("Escape").unwrap();
        assert!(combo.modifiers.is_empty());
        assert_eq!(combo.key, KeyCode::Escape);
    }

    #[test]
    fn test_keymap_defaults() {
        let keymap = KeyMap::default();
        assert!(!keymap.bindings.is_empty());
        // Ctrl+S should be Save
        let combo = KeyCombo::parse("Ctrl+S").unwrap();
        let action = keymap.bindings.iter().find(|b| b.combo == combo).unwrap();
        assert_eq!(action.action, EditorAction::Save);
    }

    #[test]
    fn test_manager_lookup() {
        let manager = KeyBindingManager::new(PathBuf::from("/tmp/test_keybindings"));
        let combo = KeyCombo::parse("Ctrl+Shift+P").unwrap();
        let action = manager.lookup(&combo);
        assert!(action.is_some());
        assert_eq!(*action.unwrap(), EditorAction::OpenCommandPalette);
    }

    #[test]
    fn test_manager_register_overlay() {
        let mut manager = KeyBindingManager::new(PathBuf::from("/tmp/test_keybindings"));
        let combo = KeyCombo::parse("Ctrl+K").unwrap();
        manager.register(
            combo.clone(),
            EditorAction::Custom("test_action".into()),
            "Test action".into(),
        );
        let action = manager.lookup(&combo);
        assert!(action.is_some());
        assert_eq!(*action.unwrap(), EditorAction::Custom("test_action".into()));
    }
}
