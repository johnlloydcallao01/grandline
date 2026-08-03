use std::fmt;

// ---------------------------------------------------------------------------
// Status bar themes
// ---------------------------------------------------------------------------

/// Colors for the status bar.
#[derive(Debug, Clone)]
pub struct StatusTheme {
    /// Background of the main status bar
    pub background: StatusColor,
    /// Foreground text color
    pub foreground: StatusColor,
    /// Mode indicator colors
    pub mode_normal_bg: StatusColor,
    pub mode_normal_fg: StatusColor,
    pub mode_insert_bg: StatusColor,
    pub mode_insert_fg: StatusColor,
    pub mode_visual_bg: StatusColor,
    pub mode_visual_fg: StatusColor,
    pub mode_command_bg: StatusColor,
    pub mode_command_fg: StatusColor,
    /// Modified indicator color
    pub modified_color: StatusColor,
    /// Error/warning colors
    pub error_color: StatusColor,
    pub warning_color: StatusColor,
    pub info_color: StatusColor,
    /// Git branch colors
    pub git_color: StatusColor,
    /// Inactive item color (right side segments)
    pub inactive_bg: StatusColor,
    pub inactive_fg: StatusColor,
    /// Separator character color
    pub separator_color: StatusColor,
}

impl Default for StatusTheme {
    fn default() -> Self {
        Self::dark()
    }
}

impl StatusTheme {
    /// Dark theme (VS Code inspired)
    pub fn dark() -> Self {
        Self {
            background: StatusColor::Rgb(0, 122, 204),
            foreground: StatusColor::Rgb(255, 255, 255),
            mode_normal_bg: StatusColor::Rgb(0, 122, 204),
            mode_normal_fg: StatusColor::Rgb(255, 255, 255),
            mode_insert_bg: StatusColor::Rgb(16, 185, 129),
            mode_insert_fg: StatusColor::Rgb(255, 255, 255),
            mode_visual_bg: StatusColor::Rgb(139, 92, 246),
            mode_visual_fg: StatusColor::Rgb(255, 255, 255),
            mode_command_bg: StatusColor::Rgb(245, 158, 11),
            mode_command_fg: StatusColor::Rgb(0, 0, 0),
            modified_color: StatusColor::Rgb(255, 165, 0),
            error_color: StatusColor::Rgb(248, 113, 113),
            warning_color: StatusColor::Rgb(251, 191, 36),
            info_color: StatusColor::Rgb(96, 165, 250),
            git_color: StatusColor::Rgb(139, 92, 246),
            inactive_bg: StatusColor::Rgb(37, 37, 38),
            inactive_fg: StatusColor::Rgb(204, 204, 204),
            separator_color: StatusColor::Rgb(100, 100, 100),
        }
    }

    /// Light theme
    pub fn light() -> Self {
        Self {
            background: StatusColor::Rgb(0, 122, 204),
            foreground: StatusColor::Rgb(255, 255, 255),
            mode_normal_bg: StatusColor::Rgb(0, 122, 204),
            mode_normal_fg: StatusColor::Rgb(255, 255, 255),
            mode_insert_bg: StatusColor::Rgb(16, 185, 129),
            mode_insert_fg: StatusColor::Rgb(255, 255, 255),
            mode_visual_bg: StatusColor::Rgb(139, 92, 246),
            mode_visual_fg: StatusColor::Rgb(255, 255, 255),
            mode_command_bg: StatusColor::Rgb(245, 158, 11),
            mode_command_fg: StatusColor::Rgb(0, 0, 0),
            modified_color: StatusColor::Rgb(220, 130, 0),
            error_color: StatusColor::Rgb(220, 50, 50),
            warning_color: StatusColor::Rgb(180, 130, 0),
            info_color: StatusColor::Rgb(50, 120, 200),
            git_color: StatusColor::Rgb(100, 70, 200),
            inactive_bg: StatusColor::Rgb(240, 240, 240),
            inactive_fg: StatusColor::Rgb(80, 80, 80),
            separator_color: StatusColor::Rgb(180, 180, 180),
        }
    }
}

// ---------------------------------------------------------------------------
// Color representation
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StatusColor {
    /// Standard ANSI color (0-255)
    Ansi(u8),
    /// 24-bit RGB
    Rgb(u8, u8, u8),
    /// Named color (mapped to ANSI at render time)
    Named(NamedColor),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NamedColor {
    Black,
    Red,
    Green,
    Yellow,
    Blue,
    Magenta,
    Cyan,
    White,
    BrightBlack,
    BrightRed,
    BrightGreen,
    BrightYellow,
    BrightBlue,
    BrightMagenta,
    BrightCyan,
    BrightWhite,
}

impl StatusColor {
    /// Generate ANSI escape sequence for foreground color.
    pub fn fg_escape(&self) -> String {
        match self {
            StatusColor::Ansi(n) => format!("\x1b[38;5;{}m", n),
            StatusColor::Rgb(r, g, b) => format!("\x1b[38;2;{};{};{}m", r, g, b),
            StatusColor::Named(c) => match c {
                NamedColor::Black => "\x1b[30m".into(),
                NamedColor::Red => "\x1b[31m".into(),
                NamedColor::Green => "\x1b[32m".into(),
                NamedColor::Yellow => "\x1b[33m".into(),
                NamedColor::Blue => "\x1b[34m".into(),
                NamedColor::Magenta => "\x1b[35m".into(),
                NamedColor::Cyan => "\x1b[36m".into(),
                NamedColor::White => "\x1b[37m".into(),
                NamedColor::BrightBlack => "\x1b[90m".into(),
                NamedColor::BrightRed => "\x1b[91m".into(),
                NamedColor::BrightGreen => "\x1b[92m".into(),
                NamedColor::BrightYellow => "\x1b[93m".into(),
                NamedColor::BrightBlue => "\x1b[94m".into(),
                NamedColor::BrightMagenta => "\x1b[95m".into(),
                NamedColor::BrightCyan => "\x1b[96m".into(),
                NamedColor::BrightWhite => "\x1b[97m".into(),
            },
        }
    }

    /// Generate ANSI escape sequence for background color.
    pub fn bg_escape(&self) -> String {
        match self {
            StatusColor::Ansi(n) => format!("\x1b[48;5;{}m", n),
            StatusColor::Rgb(r, g, b) => format!("\x1b[48;2;{};{};{}m", r, g, b),
            StatusColor::Named(c) => match c {
                NamedColor::Black => "\x1b[40m".into(),
                NamedColor::Red => "\x1b[41m".into(),
                NamedColor::Green => "\x1b[42m".into(),
                NamedColor::Yellow => "\x1b[43m".into(),
                NamedColor::Blue => "\x1b[44m".into(),
                NamedColor::Magenta => "\x1b[45m".into(),
                NamedColor::Cyan => "\x1b[46m".into(),
                NamedColor::White => "\x1b[47m".into(),
                NamedColor::BrightBlack => "\x1b[100m".into(),
                NamedColor::BrightRed => "\x1b[101m".into(),
                NamedColor::BrightGreen => "\x1b[102m".into(),
                NamedColor::BrightYellow => "\x1b[103m".into(),
                NamedColor::BrightBlue => "\x1b[104m".into(),
                NamedColor::BrightMagenta => "\x1b[105m".into(),
                NamedColor::BrightCyan => "\x1b[106m".into(),
                NamedColor::BrightWhite => "\x1b[107m".into(),
            },
        }
    }
}

// ---------------------------------------------------------------------------
// Status bar item
// ---------------------------------------------------------------------------

/// A single segment in the status bar.
#[derive(Debug, Clone)]
pub struct StatusItem {
    /// Text content
    pub text: String,
    /// Foreground color
    pub fg: StatusColor,
    /// Background color
    pub bg: StatusColor,
    /// Optional icon prefix (e.g. Git branch icon)
    pub icon: Option<String>,
    /// Priority for ordering (lower = leftmost)
    pub priority: u8,
    /// Tooltip text (shown on hover / long press)
    pub tooltip: Option<String>,
    /// Click action identifier
    pub click_action: Option<String>,
}

impl StatusItem {
    pub fn new(text: impl Into<String>, fg: StatusColor, bg: StatusColor) -> Self {
        Self {
            text: text.into(),
            fg,
            bg,
            icon: None,
            priority: 50,
            tooltip: None,
            click_action: None,
        }
    }

    pub fn with_icon(mut self, icon: impl Into<String>) -> Self {
        self.icon = Some(icon.into());
        self
    }

    pub fn with_priority(mut self, priority: u8) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_tooltip(mut self, tooltip: impl Into<String>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    pub fn with_click_action(mut self, action: impl Into<String>) -> Self {
        self.click_action = Some(action.into());
        self
    }

    /// Render this item to a string with ANSI colors.
    pub fn render(&self) -> String {
        let icon_str = self
            .icon
            .as_ref()
            .map(|i| format!("{} ", i))
            .unwrap_or_default();
        format!(
            "{}{}{}{}{}",
            self.bg.bg_escape(),
            self.fg.fg_escape(),
            icon_str,
            self.text,
            "\x1b[0m"
        )
    }

    /// Get the display width (excluding ANSI codes).
    pub fn display_width(&self) -> usize {
        let icon_width = self.icon.as_ref().map(|i| i.len() + 1).unwrap_or(0);
        icon_width + self.text.len()
    }
}

// ---------------------------------------------------------------------------
// Mode indicator
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StatusMode {
    Normal,
    Insert,
    Visual,
    Command,
}

impl StatusMode {
    pub fn label(&self) -> &str {
        match self {
            StatusMode::Normal => "NORMAL",
            StatusMode::Insert => "INSERT",
            StatusMode::Visual => "VISUAL",
            StatusMode::Command => "COMMAND",
        }
    }

    pub fn colors(&self, theme: &StatusTheme) -> (StatusColor, StatusColor) {
        match self {
            StatusMode::Normal => (theme.mode_normal_bg, theme.mode_normal_fg),
            StatusMode::Insert => (theme.mode_insert_bg, theme.mode_insert_fg),
            StatusMode::Visual => (theme.mode_visual_bg, theme.mode_visual_fg),
            StatusMode::Command => (theme.mode_command_bg, theme.mode_command_fg),
        }
    }
}

// ---------------------------------------------------------------------------
// Status bar state
// ---------------------------------------------------------------------------

/// Holds all the data needed to render the status bar.
pub struct StatusBarState {
    /// Current mode
    pub mode: StatusMode,
    /// File name (if any)
    pub file_name: Option<String>,
    /// Full file path
    pub file_path: Option<String>,
    /// Whether the file has been modified
    pub modified: bool,
    /// Language / file type
    pub language: Option<String>,
    /// Cursor line (1-indexed)
    pub cursor_line: usize,
    /// Cursor column (1-indexed)
    pub cursor_column: usize,
    /// Total lines in the file
    pub total_lines: usize,
    /// Git branch name
    pub git_branch: Option<String>,
    /// Number of diagnostics
    pub diagnostics_error: usize,
    pub diagnostics_warning: usize,
    pub diagnostics_info: usize,
    /// Custom status items (right side)
    pub custom_items: Vec<StatusItem>,
    /// Current message to display (e.g. "Saved" or error)
    pub message: Option<StatusMessage>,
}

/// A temporary message in the status bar.
#[derive(Debug, Clone)]
pub struct StatusMessage {
    pub text: String,
    pub kind: StatusMessageKind,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StatusMessageKind {
    Info,
    Warning,
    Error,
    Success,
}

impl StatusMessage {
    pub fn info(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            kind: StatusMessageKind::Info,
        }
    }

    pub fn warning(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            kind: StatusMessageKind::Warning,
        }
    }

    pub fn error(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            kind: StatusMessageKind::Error,
        }
    }

    pub fn success(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            kind: StatusMessageKind::Success,
        }
    }
}

impl Default for StatusBarState {
    fn default() -> Self {
        Self {
            mode: StatusMode::Normal,
            file_name: None,
            file_path: None,
            modified: false,
            language: None,
            cursor_line: 1,
            cursor_column: 1,
            total_lines: 1,
            git_branch: None,
            diagnostics_error: 0,
            diagnostics_warning: 0,
            diagnostics_info: 0,
            custom_items: Vec::new(),
            message: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Status bar renderer
// ---------------------------------------------------------------------------

pub struct StatusBar<'a> {
    state: &'a StatusBarState,
    theme: &'a StatusTheme,
    width: usize,
}

impl<'a> StatusBar<'a> {
    pub fn new(state: &'a StatusBarState, theme: &'a StatusTheme, width: usize) -> Self {
        Self {
            state,
            theme,
            width,
        }
    }

    /// Render the complete status bar line.
    pub fn render(&self) -> String {
        // If there's a message, show it instead of the normal status bar
        if let Some(ref msg) = self.state.message {
            return self.render_message(msg);
        }

        let mut output = String::new();

        // ── Left side ───────────────────────────────────────────────────
        let mut left_parts: Vec<String> = Vec::new();

        // Mode indicator
        let mode_item = self.render_mode_indicator();
        left_parts.push(mode_item);

        // File name with modified indicator
        if let Some(ref name) = self.state.file_name {
            let modified_str = if self.state.modified { " ●" } else { "" };
            left_parts.push(format!(
                "{}{}{}",
                self.theme.background.bg_escape(),
                self.theme.foreground.fg_escape(),
                format!(" {}{}", name, modified_str),
            ));
        }

        // ── Right side ──────────────────────────────────────────────────
        let mut right_parts: Vec<String> = Vec::new();

        // Diagnostics
        if self.state.diagnostics_error > 0 {
            right_parts.push(self.render_diagnostic(
                &format!("{} ✕", self.state.diagnostics_error),
                self.theme.error_color,
            ));
        }
        if self.state.diagnostics_warning > 0 {
            right_parts.push(self.render_diagnostic(
                &format!("{} ⚠", self.state.diagnostics_warning),
                self.theme.warning_color,
            ));
        }

        // Git branch
        if let Some(ref branch) = self.state.git_branch {
            right_parts.push(format!(
                "{}{}{}",
                self.theme.inactive_bg.bg_escape(),
                self.theme.git_color.fg_escape(),
                format!(" {} ", branch),
            ));
        }

        // Language
        if let Some(ref lang) = self.state.language {
            right_parts.push(format!(
                "{}{}{}",
                self.theme.inactive_bg.bg_escape(),
                self.theme.inactive_fg.fg_escape(),
                format!(" {} ", lang),
            ));
        }

        // Cursor position
        right_parts.push(format!(
            "{}{}{}",
            self.theme.inactive_bg.bg_escape(),
            self.theme.inactive_fg.fg_escape(),
            format!(" Ln {}, Col {} ", self.state.cursor_line, self.state.cursor_column),
        ));

        // Line count
        right_parts.push(format!(
            "{}{}{}",
            self.theme.inactive_bg.bg_escape(),
            self.theme.inactive_fg.fg_escape(),
            format!(" {}/{} ", self.state.cursor_line, self.state.total_lines),
        ));

        // Custom items (sorted by priority)
        let mut sorted_custom = self.state.custom_items.clone();
        sorted_custom.sort_by_key(|item| item.priority);
        for item in &sorted_custom {
            right_parts.push(item.render());
        }

        // ── Compose ─────────────────────────────────────────────────────
        let left_rendered: String = left_parts.join("");
        let right_rendered: String = right_parts.join("");

        let left_display_width = self.calculate_display_width(&left_parts);
        let right_display_width = self.calculate_display_width(&right_parts);
        let separator_width = self.width.saturating_sub(left_display_width + right_display_width);

        output.push_str(&left_rendered);
        output.push_str(&" ".repeat(separator_width));
        output.push_str(&right_rendered);
        output.push_str("\x1b[0m");

        output
    }

    /// Render just the mode indicator segment.
    fn render_mode_indicator(&self) -> String {
        let (bg, fg) = self.state.mode.colors(self.theme);
        format!(
            "{}{}{}",
            bg.bg_escape(),
            fg.fg_escape(),
            format!(" {} ", self.state.mode.label()),
        )
    }

    /// Render a diagnostic count segment.
    fn render_diagnostic(&self, text: &str, color: StatusColor) -> String {
        format!(
            "{}{}{}",
            self.theme.inactive_bg.bg_escape(),
            color.fg_escape(),
            format!(" {} ", text),
        )
    }

    /// Render a message (replaces the normal status bar).
    fn render_message(&self, msg: &StatusMessage) -> String {
        let (bg, fg) = match msg.kind {
            StatusMessageKind::Info => (self.theme.info_color, StatusColor::Rgb(255, 255, 255)),
            StatusMessageKind::Warning => {
                (self.theme.warning_color, StatusColor::Rgb(0, 0, 0))
            }
            StatusMessageKind::Error => (self.theme.error_color, StatusColor::Rgb(255, 255, 255)),
            StatusMessageKind::Success => (
                StatusColor::Rgb(16, 185, 129),
                StatusColor::Rgb(255, 255, 255),
            ),
        };

        let prefix = match msg.kind {
            StatusMessageKind::Info => "ℹ ",
            StatusMessageKind::Warning => "⚠ ",
            StatusMessageKind::Error => "✕ ",
            StatusMessageKind::Success => "✓ ",
        };

        let mut text = format!("{}{}", prefix, msg.text);
        if text.len() > self.width {
            text.truncate(self.width - 3);
            text.push_str("...");
        }

        let padding = self.width.saturating_sub(text.len());
        format!(
            "{}{}{}{}{}\x1b[0m",
            bg.bg_escape(),
            fg.fg_escape(),
            text,
            " ".repeat(padding),
            "",
        )
    }

    /// Calculate the visible display width of rendered parts (strip ANSI codes).
    fn calculate_display_width(&self, parts: &[String]) -> usize {
        // Simple heuristic: count non-ANSI characters
        parts
            .iter()
            .map(|s| strip_ansi_len(s))
            .sum()
    }
}

// ---------------------------------------------------------------------------
// Hit testing for mouse clicks
// ---------------------------------------------------------------------------

/// Determine what the user clicked on in the status bar.
#[derive(Debug, Clone)]
pub enum StatusBarHitTest {
    /// Clicked on the mode indicator
    Mode,
    /// Clicked on the file name
    FileName,
    /// Clicked on git branch
    GitBranch,
    /// Clicked on language
    Language,
    /// Clicked on cursor position
    CursorPosition,
    /// Clicked on a custom item
    CustomItem(usize),
    /// Clicked on empty space
    Empty,
}

impl StatusBarState {
    /// Determine what was clicked at the given column.
    pub fn hit_test(&self, col: usize, terminal_width: usize) -> StatusBarHitTest {
        // This is a simplified hit test. A real implementation would track
        // the exact column ranges of each rendered segment.
        //
        // Layout approximation:
        //   [MODE] [file name]...[diagnostics] [git] [lang] [cursor] [lines]

        let _ = (col, terminal_width);

        // For now, return based on rough column ranges
        // The mode indicator is typically ~10 chars wide
        if col < 10 {
            StatusBarHitTest::Mode
        } else {
            StatusBarHitTest::Empty
        }
    }
}

// ---------------------------------------------------------------------------
// ANSI helpers
// ---------------------------------------------------------------------------

/// Calculate the visible length of a string (excluding ANSI escape sequences).
fn strip_ansi_len(s: &str) -> usize {
    let mut len = 0;
    let mut in_escape = false;
    for ch in s.chars() {
        if ch == '\x1b' {
            in_escape = true;
            continue;
        }
        if in_escape {
            if ch == 'm' {
                in_escape = false;
            }
            continue;
        }
        len += 1;
    }
    len
}

// ---------------------------------------------------------------------------
// Display impl for formatting
// ---------------------------------------------------------------------------

impl fmt::Display for StatusMessage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.text)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_color_escape() {
        let c = StatusColor::Rgb(255, 0, 0);
        assert_eq!(c.fg_escape(), "\x1b[38;2;255;0;0m");
        assert_eq!(c.bg_escape(), "\x1b[48;2;255;0;0m");
    }

    #[test]
    fn test_mode_indicator() {
        let state = StatusBarState::default();
        let theme = StatusTheme::dark();
        let bar = StatusBar::new(&state, &theme, 80);
        let rendered = bar.render_mode_indicator();
        assert!(rendered.contains("NORMAL"));
    }

    #[test]
    fn test_status_item_render() {
        let item = StatusItem::new("test", StatusColor::Rgb(255, 255, 255), StatusColor::Rgb(0, 0, 0));
        let rendered = item.render();
        assert!(rendered.contains("test"));
        assert!(rendered.contains("\x1b[0m")); // reset at end
    }

    #[test]
    fn test_strip_ansi_len() {
        assert_eq!(strip_ansi_len("hello"), 5);
        assert_eq!(strip_ansi_len("\x1b[31mhello\x1b[0m"), 5);
        assert_eq!(strip_ansi_len("\x1b[38;2;255;0;0mR\x1b[0m"), 1);
    }

    #[test]
    fn test_message_render() {
        let mut state = StatusBarState::default();
        state.message = Some(StatusMessage::success("File saved"));
        let theme = StatusTheme::dark();
        let bar = StatusBar::new(&state, &theme, 80);
        let rendered = bar.render();
        assert!(rendered.contains("File saved"));
        assert!(rendered.contains("✓"));
    }
}
