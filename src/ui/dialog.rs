use std::fmt;

use crate::ui::input::TextBuffer;
use crate::ui::theme::ThemeColor;

// ---------------------------------------------------------------------------
// Dialog action – what happens when the user interacts with a dialog
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub enum DialogAction {
    /// Confirm / accept
    Confirm,
    /// Cancel / dismiss
    Cancel,
    /// A named action (button-specific)
    Custom(String),
    /// Input was submitted
    Submit(String),
    /// Input was changed
    InputChanged(String),
}

impl fmt::Display for DialogAction {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DialogAction::Confirm => write!(f, "Confirm"),
            DialogAction::Cancel => write!(f, "Cancel"),
            DialogAction::Custom(name) => write!(f, "{}", name),
            DialogAction::Submit(text) => write!(f, "Submit: {}", text),
            DialogAction::InputChanged(text) => write!(f, "Input: {}", text),
        }
    }
}

// ---------------------------------------------------------------------------
// Dialog button
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct DialogButton {
    pub label: String,
    pub action: DialogAction,
    pub is_default: bool,
    pub is_destructive: bool,
}

impl DialogButton {
    pub fn ok() -> Self {
        Self {
            label: "OK".into(),
            action: DialogAction::Confirm,
            is_default: true,
            is_destructive: false,
        }
    }

    pub fn cancel() -> Self {
        Self {
            label: "Cancel".into(),
            action: DialogAction::Cancel,
            is_default: false,
            is_destructive: false,
        }
    }

    pub fn yes() -> Self {
        Self {
            label: "Yes".into(),
            action: DialogAction::Confirm,
            is_default: true,
            is_destructive: false,
        }
    }

    pub fn no() -> Self {
        Self {
            label: "No".into(),
            action: DialogAction::Cancel,
            is_default: false,
            is_destructive: false,
        }
    }

    pub fn custom(label: impl Into<String>, action: DialogAction) -> Self {
        Self {
            label: label.into(),
            action,
            is_default: false,
            is_destructive: false,
        }
    }

    pub fn destructive(label: impl Into<String>, action: DialogAction) -> Self {
        Self {
            label: label.into(),
            action,
            is_default: false,
            is_destructive: true,
        }
    }
}

// ---------------------------------------------------------------------------
// Dialog trait – all dialogs implement this
// ---------------------------------------------------------------------------

pub trait Dialog: fmt::Display {
    /// Process a keypress and return an optional action.
    fn handle_key(&mut self, key: &DialogInput) -> Option<DialogAction>;

    /// Render the dialog to a string.
    fn render(&self, width: usize) -> DialogRenderOutput;

    /// Get the title of the dialog.
    fn title(&self) -> &str;

    /// Whether this dialog captures all input (modal).
    fn is_modal(&self) -> bool {
        true
    }

    /// Whether the dialog should be dismissed on Escape.
    fn dismissible(&self) -> bool {
        true
    }
}

/// Key input passed to dialogs.
#[derive(Debug, Clone)]
pub struct DialogInput {
    pub key: DialogKey,
    pub ctrl: bool,
    pub alt: bool,
    pub shift: bool,
}

#[derive(Debug, Clone)]
pub enum DialogKey {
    Char(char),
    Enter,
    Escape,
    Tab,
    Backspace,
    Delete,
    Left,
    Right,
    Up,
    Down,
    Home,
    End,
}

/// Rendered dialog output.
#[derive(Debug, Clone)]
pub struct DialogRenderOutput {
    /// The rendered dialog lines (each line is a string with ANSI codes)
    pub lines: Vec<String>,
    /// The title bar
    pub title_line: String,
    /// The button bar at the bottom
    pub button_line: String,
    /// Total height of the dialog (including borders)
    pub height: u16,
    /// Total width of the dialog
    pub width: u16,
    /// Which button is currently focused
    pub focused_button: usize,
    /// Where the cursor should be placed (if input field)
    pub cursor_x: Option<u16>,
    pub cursor_y: Option<u16>,
}

// ---------------------------------------------------------------------------
// Confirm dialog
// ---------------------------------------------------------------------------

pub struct ConfirmDialog {
    pub title: String,
    pub message: String,
    pub buttons: Vec<DialogButton>,
    pub focused_button: usize,
    pub theme: DialogTheme,
}

impl ConfirmDialog {
    pub fn new(title: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            message: message.into(),
            buttons: vec![DialogButton::yes(), DialogButton::cancel()],
            focused_button: 0,
            theme: DialogTheme::default(),
        }
    }

    pub fn with_theme(mut self, theme: DialogTheme) -> Self {
        self.theme = theme;
        self
    }

    pub fn with_buttons(mut self, buttons: Vec<DialogButton>) -> Self {
        self.buttons = buttons;
        self
    }
}

impl Dialog for ConfirmDialog {
    fn handle_key(&mut self, input: &DialogInput) -> Option<DialogAction> {
        match input.key {
            DialogKey::Escape => {
                if self.dismissible() {
                    Some(DialogAction::Cancel)
                } else {
                    None
                }
            }
            DialogKey::Enter => {
                let action = self.buttons[self.focused_button].action.clone();
                Some(action)
            }
            DialogKey::Left => {
                if self.focused_button > 0 {
                    self.focused_button -= 1;
                } else {
                    self.focused_button = self.buttons.len() - 1;
                }
                None
            }
            DialogKey::Right => {
                if self.focused_button < self.buttons.len() - 1 {
                    self.focused_button += 1;
                } else {
                    self.focused_button = 0;
                }
                None
            }
            DialogKey::Tab => {
                if input.shift {
                    if self.focused_button > 0 {
                        self.focused_button -= 1;
                    } else {
                        self.focused_button = self.buttons.len() - 1;
                    }
                } else if self.focused_button < self.buttons.len() - 1 {
                    self.focused_button += 1;
                } else {
                    self.focused_button = 0;
                }
                None
            }
            _ => None,
        }
    }

    fn render(&self, max_width: usize) -> DialogRenderOutput {
        let min_width = 40;
        let max_dialog_width = max_width.saturating_sub(4).min(80);
        let width = min_width.max(max_dialog_width).min(max_width);
        let content_width = width.saturating_sub(4); // 2 borders + 2 padding

        let mut lines: Vec<String> = Vec::new();

        // Message area
        let wrapped = wrap_text(&self.message, content_width.saturating_sub(4));
        for line in &wrapped {
            let padding = content_width.saturating_sub(line.len());
            lines.push(format!(
                "  {:<width$}  ",
                line,
                width = content_width.saturating_sub(2)
            ));
        }

        let title_line = self.render_title_bar(width);
        let button_line = self.render_button_bar(width);

        // Calculate total height: top border + title + separator + message + separator + buttons + bottom border
        let height = 2 + lines.len() as u16 + 2 + 2;

        DialogRenderOutput {
            lines,
            title_line,
            button_line,
            height,
            width: width as u16,
            focused_button: self.focused_button,
            cursor_x: None,
            cursor_y: None,
        }
    }

    fn title(&self) -> &str {
        &self.title
    }
}

impl fmt::Display for ConfirmDialog {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Confirm: {}", self.title)
    }
}

// ---------------------------------------------------------------------------
// About dialog
// ---------------------------------------------------------------------------

pub struct AboutDialog {
    pub app_name: String,
    pub version: String,
    pub description: String,
    pub website: Option<String>,
    pub license: Option<String>,
    pub focused_button: usize,
    pub theme: DialogTheme,
}

impl AboutDialog {
    pub fn new(app_name: impl Into<String>, version: impl Into<String>) -> Self {
        Self {
            app_name: app_name.into(),
            version: version.into(),
            description: "A modern text editor for the terminal.".into(),
            website: None,
            license: None,
            focused_button: 0,
            theme: DialogTheme::default(),
        }
    }

    pub fn with_description(mut self, desc: impl Into<String>) -> Self {
        self.description = desc.into();
        self
    }

    pub fn with_website(mut self, url: impl Into<String>) -> Self {
        self.website = Some(url.into());
        self
    }

    pub fn with_license(mut self, license: impl Into<String>) -> Self {
        self.license = Some(license.into());
        self
    }

    pub fn with_theme(mut self, theme: DialogTheme) -> Self {
        self.theme = theme;
        self
    }
}

impl Dialog for AboutDialog {
    fn handle_key(&mut self, input: &DialogInput) -> Option<DialogAction> {
        match input.key {
            DialogKey::Escape => Some(DialogAction::Cancel),
            DialogKey::Enter => Some(DialogAction::Confirm),
            _ => None,
        }
    }

    fn render(&self, max_width: usize) -> DialogRenderOutput {
        let width = 50.min(max_width.saturating_sub(4));
        let content_width = width.saturating_sub(4);

        let mut lines: Vec<String> = Vec::new();

        // App name (centered, bold)
        let name_display = format!("{} {}", self.app_name, self.version);
        let centered = center_str(&name_display, content_width.saturating_sub(2));
        lines.push(format!("  {:<width$}  ", centered, width = content_width.saturating_sub(2)));

        lines.push(format!("  {:<width$}  ", "", width = content_width.saturating_sub(2)));

        // Description (wrapped)
        let wrapped = wrap_text(&self.description, content_width.saturating_sub(4));
        for line in &wrapped {
            lines.push(format!(
                "  {:<width$}  ",
                line,
                width = content_width.saturating_sub(2)
            ));
        }

        // Website
        if let Some(ref url) = self.website {
            lines.push(format!("  {:<width$}  ", "", width = content_width.saturating_sub(2)));
            let display = format!("🌐 {}", url);
            lines.push(format!(
                "  {:<width$}  ",
                display,
                width = content_width.saturating_sub(2)
            ));
        }

        // License
        if let Some(ref license) = self.license {
            lines.push(format!("  {:<width$}  ", "", width = content_width.saturating_sub(2)));
            let display = format!("License: {}", license);
            lines.push(format!(
                "  {:<width$}  ",
                display,
                width = content_width.saturating_sub(2)
            ));
        }

        let title_line = self.render_title_bar(width);
        let button_line = format!(
            " {} ",
            self.theme.button_primary_fg.fg_escape()
        ) + &format!(
            "{:^width$}",
            "OK",
            width = width.saturating_sub(2)
        ) + &"\x1b[0m";

        let height = 2 + lines.len() as u16 + 2;

        DialogRenderOutput {
            lines,
            title_line,
            button_line,
            height,
            width: width as u16,
            focused_button: 0,
            cursor_x: None,
            cursor_y: None,
        }
    }

    fn title(&self) -> &str {
        "About"
    }
}

impl fmt::Display for AboutDialog {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "About {}", self.app_name)
    }
}

// ---------------------------------------------------------------------------
// Input dialog (Go To Line, Find, Replace, etc.)
// ---------------------------------------------------------------------------

pub struct InputDialog {
    pub title: String,
    pub placeholder: String,
    pub buffer: TextBuffer,
    pub prompt: String,
    pub buttons: Vec<DialogButton>,
    pub focused_button: usize,
    pub focused_input: bool,
    pub theme: DialogTheme,
}

impl InputDialog {
    pub fn new(title: impl Into<String>, placeholder: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            placeholder: placeholder.into(),
            buffer: TextBuffer::new(),
            prompt: String::new(),
            buttons: vec![DialogButton::ok(), DialogButton::cancel()],
            focused_button: 0,
            focused_input: true,
            theme: DialogTheme::default(),
        }
    }

    pub fn with_prompt(mut self, prompt: impl Into<String>) -> Self {
        self.prompt = prompt.into();
        self
    }

    pub fn with_initial_value(mut self, value: impl Into<String>) -> Self {
        let val = value.into();
        self.buffer.insert_str(&val);
        self
    }

    pub fn with_buttons(mut self, buttons: Vec<DialogButton>) -> Self {
        self.buttons = buttons;
        self
    }

    pub fn with_theme(mut self, theme: DialogTheme) -> Self {
        self.theme = theme;
        self
    }

    pub fn text(&self) -> String {
        self.buffer.text()
    }
}

impl Dialog for InputDialog {
    fn handle_key(&mut self, input: &DialogInput) -> Option<DialogAction> {
        if self.focused_input {
            match input.key {
                DialogKey::Enter => Some(DialogAction::Submit(self.buffer.text())),
                DialogKey::Escape => {
                    if self.dismissible() {
                        Some(DialogAction::Cancel)
                    } else {
                        None
                    }
                }
                DialogKey::Tab => {
                    self.focused_input = false;
                    self.focused_button = 0;
                    None
                }
                DialogKey::Char(ch) => {
                    self.buffer.insert(ch);
                    Some(DialogAction::InputChanged(self.buffer.text()))
                }
                DialogKey::Backspace => {
                    self.buffer.delete_back();
                    Some(DialogAction::InputChanged(self.buffer.text()))
                }
                DialogKey::Delete => {
                    self.buffer.delete_forward();
                    Some(DialogAction::InputChanged(self.buffer.text()))
                }
                DialogKey::Left => {
                    self.buffer.move_left();
                    None
                }
                DialogKey::Right => {
                    self.buffer.move_right();
                    None
                }
                DialogKey::Home => {
                    self.buffer.move_to_start();
                    None
                }
                DialogKey::End => {
                    self.buffer.move_to_end();
                    None
                }
                _ => None,
            }
        } else {
            // Button navigation
            match input.key {
                DialogKey::Escape => Some(DialogAction::Cancel),
                DialogKey::Enter => {
                    let action = self.buttons[self.focused_button].action.clone();
                    Some(action)
                }
                DialogKey::Tab => {
                    if input.shift {
                        if self.focused_button > 0 {
                            self.focused_button -= 1;
                        } else {
                            self.focused_input = true;
                        }
                    } else if self.focused_button < self.buttons.len() - 1 {
                        self.focused_button += 1;
                    } else {
                        self.focused_input = true;
                    }
                    None
                }
                DialogKey::Left => {
                    if self.focused_button > 0 {
                        self.focused_button -= 1;
                    }
                    None
                }
                DialogKey::Right => {
                    if self.focused_button < self.buttons.len() - 1 {
                        self.focused_button += 1;
                    }
                    None
                }
                _ => None,
            }
        }
    }

    fn render(&self, max_width: usize) -> DialogRenderOutput {
        let width = 50.min(max_width.saturating_sub(4));
        let content_width = width.saturating_sub(4);

        let mut lines: Vec<String> = Vec::new();

        // Prompt
        if !self.prompt.is_empty() {
            lines.push(format!(
                "  {:<width$}  ",
                &self.prompt,
                width = content_width.saturating_sub(2)
            ));
        }

        // Input field
        let input_display = if self.buffer.is_empty() {
            format!("{}{}", self.theme.input_placeholder.fg_escape(), &self.placeholder)
        } else {
            self.buffer.render(content_width.saturating_sub(4))
        };

        lines.push(format!(
            "  {}{}{}",
            self.theme.input_border.fg_escape(),
            "─".repeat(content_width.saturating_sub(2)),
            "\x1b[0m"
        ));
        lines.push(format!(
            "  {} {} {}",
            self.theme.input_border.fg_escape(),
            input_display,
            "\x1b[0m"
        ));
        lines.push(format!(
            "  {}{}{}",
            self.theme.input_border.fg_escape(),
            "─".repeat(content_width.saturating_sub(2)),
            "\x1b[0m"
        ));

        let title_line = self.render_title_bar(width);
        let button_line = self.render_button_bar(width);

        let height = 2 + lines.len() as u16 + 2;

        // Cursor position for input
        let cursor_x = if self.focused_input {
            Some(4 + self.buffer.cursor() as u16)
        } else {
            None
        };
        let cursor_y = if self.focused_input {
            Some(2 + self.prompt.is_empty() as u16 + 2) // after prompt + border line
        } else {
            None
        };

        DialogRenderOutput {
            lines,
            title_line,
            button_line,
            height,
            width: width as u16,
            focused_button: self.focused_button,
            cursor_x,
            cursor_y,
        }
    }

    fn title(&self) -> &str {
        &self.title
    }
}

impl fmt::Display for InputDialog {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.title)
    }
}

// ---------------------------------------------------------------------------
// Dialog theme
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct DialogTheme {
    pub title_bg: ThemeColor,
    pub title_fg: ThemeColor,
    pub body_bg: ThemeColor,
    pub body_fg: ThemeColor,
    pub border_color: ThemeColor,
    pub button_bg: ThemeColor,
    pub button_fg: ThemeColor,
    pub button_focused_bg: ThemeColor,
    pub button_focused_fg: ThemeColor,
    pub button_destructive_bg: ThemeColor,
    pub button_destructive_fg: ThemeColor,
    pub input_bg: ThemeColor,
    pub input_border: ThemeColor,
    pub input_fg: ThemeColor,
    pub input_placeholder: ThemeColor,
}

impl Default for DialogTheme {
    fn default() -> Self {
        use crate::ui::theme::Rgb;
        Self {
            title_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            title_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            body_bg: ThemeColor::Rgb(Rgb::new(37, 37, 38)),
            body_fg: ThemeColor::Rgb(Rgb::new(204, 204, 204)),
            border_color: ThemeColor::Rgb(Rgb::new(80, 80, 80)),
            button_bg: ThemeColor::Rgb(Rgb::new(60, 60, 60)),
            button_fg: ThemeColor::Rgb(Rgb::new(204, 204, 204)),
            button_focused_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            button_focused_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            button_destructive_bg: ThemeColor::Rgb(Rgb::new(200, 40, 40)),
            button_destructive_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            input_bg: ThemeColor::Rgb(Rgb::new(30, 30, 30)),
            input_border: ThemeColor::Rgb(Rgb::new(80, 80, 80)),
            input_fg: ThemeColor::Rgb(Rgb::new(204, 204, 204)),
            input_placeholder: ThemeColor::Rgb(Rgb::new(120, 120, 120)),
        }
    }
}

impl DialogTheme {
    pub fn light() -> Self {
        use crate::ui::theme::Rgb;
        Self {
            title_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            title_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            body_bg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            body_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            border_color: ThemeColor::Rgb(Rgb::new(200, 200, 200)),
            button_bg: ThemeColor::Rgb(Rgb::new(230, 230, 230)),
            button_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            button_focused_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            button_focused_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            button_destructive_bg: ThemeColor::Rgb(Rgb::new(200, 40, 40)),
            button_destructive_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            input_bg: ThemeColor::Rgb(Rgb::new(245, 245, 245)),
            input_border: ThemeColor::Rgb(Rgb::new(200, 200, 200)),
            input_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            input_placeholder: ThemeColor::Rgb(Rgb::new(170, 170, 170)),
        }
    }
}

// ---------------------------------------------------------------------------
// Dialog manager – manages dialog stack and rendering
// ---------------------------------------------------------------------------

pub struct DialogManager {
    /// Stack of open dialogs (topmost is displayed and receives input)
    stack: Vec<Box<dyn Dialog>>,
    /// Maximum number of dialogs that can be stacked
    max_stack_depth: usize,
}

impl DialogManager {
    pub fn new() -> Self {
        Self {
            stack: Vec::new(),
            max_stack_depth: 5,
        }
    }

    /// Push a new dialog onto the stack (modal).
    pub fn open(&mut self, dialog: Box<dyn Dialog>) -> bool {
        if self.stack.len() >= self.max_stack_depth {
            return false;
        }
        self.stack.push(dialog);
        true
    }

    /// Close the topmost dialog.
    pub fn close(&mut self) -> Option<Box<dyn Dialog>> {
        self.stack.pop()
    }

    /// Close all dialogs.
    pub fn close_all(&mut self) {
        self.stack.clear();
    }

    /// Check if any dialog is open.
    pub fn is_open(&self) -> bool {
        !self.stack.is_empty()
    }

    /// Get the number of open dialogs.
    pub fn depth(&self) -> usize {
        self.stack.len()
    }

    /// Get a reference to the topmost dialog.
    pub fn top(&self) -> Option<&dyn Dialog> {
        self.stack.last().map(|d| d.as_ref())
    }

    /// Get a mutable reference to the topmost dialog.
    pub fn top_mut(&mut self) -> Option<&mut dyn Dialog> {
        self.stack.last_mut().map(|d| d.as_mut())
    }

    /// Send input to the topmost dialog and return its response.
    pub fn handle_input(&mut self, input: &DialogInput) -> Option<DialogAction> {
        let dialog = self.stack.last_mut()?;
        let action = dialog.handle_key(input)?;

        // Auto-close on confirm or cancel (unless it's an input change)
        match &action {
            DialogAction::Confirm | DialogAction::Cancel => {
                // Don't auto-close; let the caller decide
            }
            _ => {}
        }

        Some(action)
    }

    /// Render the topmost dialog centered in the given terminal dimensions.
    pub fn render(&self, terminal_width: usize, terminal_height: usize) -> Option<String> {
        let dialog = self.stack.last()?;
        let output = dialog.render(terminal_width);

        let dialog_width = output.width as usize;
        let dialog_height = output.height as usize;

        // Center the dialog
        let x = (terminal_width.saturating_sub(dialog_width)) / 2;
        let y = (terminal_height.saturating_sub(dialog_height)) / 2;

        let mut result = String::new();

        // Top border
        result.push_str(&format!(
            "\x1b[{};{}H{}┌{}┐\x1b[0m",
            y + 1,
            x + 1,
            output.lines.first().map(|_| "").unwrap_or(""),
            "─".repeat(dialog_width.saturating_sub(2)),
        ));

        // Title line
        result.push_str(&format!(
            "\x1b[{};{}H{}│{}│\x1b[0m",
            y + 2,
            x + 1,
            "",
            pad_center(&output.title_line, dialog_width.saturating_sub(2)),
        ));

        // Separator
        result.push_str(&format!(
            "\x1b[{};{}H├{}┤\x1b[0m",
            y + 3,
            x + 1,
            "─".repeat(dialog_width.saturating_sub(2)),
        ));

        // Content lines
        for (i, line) in output.lines.iter().enumerate() {
            result.push_str(&format!(
                "\x1b[{};{}H│{}│\x1b[0m",
                y + 4 + i,
                x + 1,
                pad_line(line, dialog_width.saturating_sub(2)),
            ));
        }

        // Separator before buttons
        let button_row = y + 4 + output.lines.len();
        result.push_str(&format!(
            "\x1b[{};{}H├{}┤\x1b[0m",
            button_row,
            x + 1,
            "─".repeat(dialog_width.saturating_sub(2)),
        ));

        // Button line
        result.push_str(&format!(
            "\x1b[{};{}H│{}│\x1b[0m",
            button_row + 1,
            x + 1,
            pad_line(&output.button_line, dialog_width.saturating_sub(2)),
        ));

        // Bottom border
        result.push_str(&format!(
            "\x1b[{};{}H└{}┘\x1b[0m",
            button_row + 2,
            x + 1,
            "─".repeat(dialog_width.saturating_sub(2)),
        ));

        // Cursor positioning
        if let (Some(cx), Some(cy)) = (output.cursor_x, output.cursor_y) {
            result.push_str(&format!("\x1b[{};{}H", y + 1 + cy as usize, x + 1 + cx as usize));
        }

        // Hide/show cursor
        if output.cursor_x.is_some() {
            result.push_str("\x1b[?25h");
        } else {
            result.push_str("\x1b[?25l");
        }

        Some(result)
    }
}

impl Default for DialogManager {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// Helper methods for ConfirmDialog / InputDialog rendering
// ---------------------------------------------------------------------------

impl ConfirmDialog {
    fn render_title_bar(&self, width: usize) -> String {
        let title = format!(" {} ", self.title);
        let padding = width.saturating_sub(title.len() + 2);
        let left_pad = padding / 2;
        let right_pad = padding - left_pad;
        format!(
            "{}{}{}",
            " ".repeat(left_pad),
            title,
            " ".repeat(right_pad)
        )
    }

    fn render_button_bar(&self, width: usize) -> String {
        let mut buttons_str = String::new();
        let total_button_width: usize = self.buttons.iter().map(|b| b.label.len() + 4).sum()
            + (self.buttons.len() - 1) * 2;

        let mut pad = (width.saturating_sub(total_button_width)) / 2;
        buttons_str.push_str(&" ".repeat(pad));

        for (i, button) in self.buttons.iter().enumerate() {
            if i > 0 {
                buttons_str.push_str("  ");
            }

            if i == self.focused_button {
                if button.is_destructive {
                    buttons_str.push_str(&self.theme.button_destructive_bg.bg_escape());
                    buttons_str.push_str(&self.theme.button_destructive_fg.fg_escape());
                } else {
                    buttons_str.push_str(&self.theme.button_focused_bg.bg_escape());
                    buttons_str.push_str(&self.theme.button_focused_fg.fg_escape());
                }
            } else {
                buttons_str.push_str(&self.theme.button_bg.bg_escape());
                buttons_str.push_str(&self.theme.button_fg.fg_escape());
            }

            buttons_str.push_str(&format!(" {} ", button.label));
            buttons_str.push_str("\x1b[0m");
        }

        buttons_str
    }
}

impl InputDialog {
    fn render_title_bar(&self, width: usize) -> String {
        let title = format!(" {} ", self.title);
        let padding = width.saturating_sub(title.len() + 2);
        let left_pad = padding / 2;
        let right_pad = padding - left_pad;
        format!(
            "{}{}{}",
            " ".repeat(left_pad),
            title,
            " ".repeat(right_pad)
        )
    }

    fn render_button_bar(&self, width: usize) -> String {
        let mut buttons_str = String::new();
        let total_button_width: usize = self.buttons.iter().map(|b| b.label.len() + 4).sum()
            + (self.buttons.len().saturating_sub(1)) * 2;

        let mut pad = (width.saturating_sub(total_button_width)) / 2;
        buttons_str.push_str(&" ".repeat(pad));

        for (i, button) in self.buttons.iter().enumerate() {
            if i > 0 {
                buttons_str.push_str("  ");
            }

            if i == self.focused_button {
                buttons_str.push_str(&self.theme.button_focused_bg.bg_escape());
                buttons_str.push_str(&self.theme.button_focused_fg.fg_escape());
            } else {
                buttons_str.push_str(&self.theme.button_bg.bg_escape());
                buttons_str.push_str(&self.theme.button_fg.fg_escape());
            }

            buttons_str.push_str(&format!(" {} ", button.label));
            buttons_str.push_str("\x1b[0m");
        }

        buttons_str
    }
}

impl AboutDialog {
    fn render_title_bar(&self, width: usize) -> String {
        let title = " About ";
        let padding = width.saturating_sub(title.len() + 2);
        let left_pad = padding / 2;
        let right_pad = padding - left_pad;
        format!(
            "{}{}{}",
            " ".repeat(left_pad),
            title,
            " ".repeat(right_pad)
        )
    }
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/// Wrap text to fit within the given width.
fn wrap_text(text: &str, max_width: usize) -> Vec<String> {
    if max_width == 0 {
        return vec![text.to_string()];
    }

    let mut lines = Vec::new();
    for paragraph in text.split('\n') {
        if paragraph.len() <= max_width {
            lines.push(paragraph.to_string());
        } else {
            let mut current = String::new();
            for word in paragraph.split_whitespace() {
                if current.is_empty() {
                    current = word.to_string();
                } else if current.len() + 1 + word.len() <= max_width {
                    current.push(' ');
                    current.push_str(word);
                } else {
                    lines.push(current);
                    current = word.to_string();
                }
            }
            if !current.is_empty() {
                lines.push(current);
            }
        }
    }
    lines
}

/// Center a string within the given width.
fn center_str(s: &str, width: usize) -> String {
    if s.len() >= width {
        s.to_string()
    } else {
        let total_pad = width - s.len();
        let left = total_pad / 2;
        let right = total_pad - left;
        format!("{}{}{}", " ".repeat(left), s, " ".repeat(right))
    }
}

/// Pad a line to the given width (truncate if too long).
fn pad_line(s: &str, width: usize) -> String {
    if s.len() >= width {
        s[..width].to_string()
    } else {
        format!("{:<width$}", s, width = width)
    }
}

/// Pad and center a line.
fn pad_center(s: &str, width: usize) -> String {
    center_str(s, width)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wrap_text() {
        let wrapped = wrap_text("Hello world, this is a test.", 10);
        assert_eq!(wrapped.len(), 3);
        assert_eq!(wrapped[0], "Hello");
        assert_eq!(wrapped[1], "world, this");
        assert_eq!(wrapped[2], "is a test.");
    }

    #[test]
    fn test_center_str() {
        assert_eq!(center_str("hi", 6), "  hi  ");
        assert_eq!(center_str("hello", 5), "hello");
        assert_eq!(center_str("hello", 3), "hel");
    }

    #[test]
    fn test_confirm_dialog_render() {
        let dialog = ConfirmDialog::new("Save", "Do you want to save?");
        let output = dialog.render(80);
        assert!(output.height > 0);
        assert!(output.lines.len() > 0);
    }

    #[test]
    fn test_dialog_manager() {
        let mut manager = DialogManager::new();
        assert!(!manager.is_open());

        let dialog = ConfirmDialog::new("Test", "Test message");
        manager.open(Box::new(dialog));
        assert!(manager.is_open());
        assert_eq!(manager.depth(), 1);

        manager.close();
        assert!(!manager.is_open());
    }

    #[test]
    fn test_input_dialog_submit() {
        let mut dialog = InputDialog::new("Go to Line", "Line number");
        let input = DialogInput {
            key: DialogKey::Char('4'),
            ctrl: false,
            alt: false,
            shift: false,
        };
        let action = dialog.handle_key(&input);
        assert!(matches!(action, Some(DialogAction::InputChanged(s)) if s == "4"));

        let input = DialogInput {
            key: DialogKey::Enter,
            ctrl: false,
            alt: false,
            shift: false,
        };
        let action = dialog.handle_key(&input);
        assert!(matches!(action, Some(DialogAction::Submit(s)) if s == "4"));
    }
}
