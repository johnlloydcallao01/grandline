use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Syntax highlighting colors
// ---------------------------------------------------------------------------

/// A color value used in syntax themes.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ThemeColor {
    /// 24-bit RGB
    Rgb(Rgb),
    /// Named / ANSI color string (e.g. "red", "#ff0000", "ansi(196)")
    Named(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Rgb {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Rgb {
    pub fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }

    /// Generate ANSI 24-bit foreground escape sequence.
    pub fn fg(&self) -> String {
        format!("\x1b[38;2;{};{};{}m", self.r, self.g, self.b)
    }

    /// Generate ANSI 24-bit background escape sequence.
    pub fn bg(&self) -> String {
        format!("\x1b[48;2;{};{};{}m", self.r, self.g, self.b)
    }

    /// Convert to CSS hex string (for the color picker).
    pub fn to_hex(&self) -> String {
        format!("#{:02x}{:02x}{:02x}", self.r, self.g, self.b)
    }

    /// Parse from hex string (e.g. "#ff0000" or "ff0000").
    pub fn from_hex(s: &str) -> Option<Self> {
        let s = s.trim().trim_start_matches('#');
        if s.len() != 6 {
            return None;
        }
        let r = u8::from_str_radix(&s[0..2], 16).ok()?;
        let g = u8::from_str_radix(&s[2..4], 16).ok()?;
        let b = u8::from_str_radix(&s[4..6], 16).ok()?;
        Some(Rgb::new(r, g, b))
    }
}

impl ThemeColor {
    pub fn rgb(&self) -> Rgb {
        match self {
            ThemeColor::Rgb(rgb) => *rgb,
            ThemeColor::Named(name) => {
                // Try to parse as hex
                if let Some(rgb) = Rgb::from_hex(name) {
                    return rgb;
                }
                // Map common names to defaults
                match name.to_lowercase().as_str() {
                    "black" => Rgb::new(0, 0, 0),
                    "red" => Rgb::new(205, 49, 49),
                    "green" => Rgb::new(13, 188, 121),
                    "yellow" => Rgb::new(229, 229, 16),
                    "blue" => Rgb::new(36, 114, 200),
                    "magenta" | "purple" => Rgb::new(188, 63, 188),
                    "cyan" => Rgb::new(17, 168, 205),
                    "white" => Rgb::new(229, 229, 229),
                    "brightblack" | "gray" | "grey" => Rgb::new(102, 102, 102),
                    "brightred" => Rgb::new(241, 76, 76),
                    "brightgreen" => Rgb::new(22, 198, 12),
                    "brightyellow" => Rgb::new(245, 245, 67),
                    "brightblue" => Rgb::new(59, 142, 234),
                    "brightmagenta" | "brightpurple" => Rgb::new(214, 112, 214),
                    "brightcyan" => Rgb::new(41, 184, 219),
                    "brightwhite" => Rgb::new(255, 255, 255),
                    _ => Rgb::new(204, 204, 204), // fallback gray
                }
            }
        }
    }

    /// Generate ANSI foreground escape.
    pub fn fg_escape(&self) -> String {
        self.rgb().fg()
    }

    /// Generate ANSI background escape.
    pub fn bg_escape(&self) -> String {
        self.rgb().bg()
    }
}

// ---------------------------------------------------------------------------
// Syntax theme
// ---------------------------------------------------------------------------

/// A syntax highlighting theme mapping token types to colors.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyntaxTheme {
    /// Theme name
    pub name: String,
    /// Theme author
    #[serde(default)]
    pub author: String,
    /// Whether this is a dark theme (affects UI chrome)
    pub dark: bool,

    // ── Editor colors ───────────────────────────────────────────────────
    /// Default text color
    pub editor_fg: ThemeColor,
    /// Editor background
    pub editor_bg: ThemeColor,
    /// Line numbers color
    pub editor_line_number: ThemeColor,
    /// Current line highlight background
    pub editor_line_highlight_bg: Option<ThemeColor>,
    /// Cursor color
    pub editor_cursor: ThemeColor,
    /// Selection background
    pub editor_selection_bg: ThemeColor,
    /// Bracket match highlight
    pub editor_bracket_match_bg: Option<ThemeColor>,
    /// Matching bracket border
    pub editor_bracket_match_border: Option<ThemeColor>,
    /// Search match background
    pub editor_search_match_bg: Option<ThemeColor>,
    /// Active search match background
    pub editor_search_active_bg: Option<ThemeColor>,
    /// Word wrap guide color
    pub editor_word_wrap_guide: Option<ThemeColor>,

    // ── Syntax token colors ─────────────────────────────────────────────
    /// Plain text
    pub syntax_text: ThemeColor,
    /// Comments (line and block)
    pub syntax_comment: ThemeColor,
    /// Keywords (if, for, while, fn, etc.)
    pub syntax_keyword: ThemeColor,
    /// Built-in types / standard library
    pub syntax_type: ThemeColor,
    /// Strings
    pub syntax_string: ThemeColor,
    /// Number literals
    pub syntax_number: ThemeColor,
    /// Boolean literals
    pub syntax_boolean: ThemeColor,
    /// Function names
    pub syntax_function: ThemeColor,
    /// Function parameters
    pub syntax_parameter: ThemeColor,
    /// Variables
    pub syntax_variable: ThemeColor,
    /// Constants
    pub syntax_constant: ThemeColor,
    /// Operator
    pub syntax_operator: ThemeColor,
    /// Punctuation
    pub syntax_punctuation: ThemeColor,
    /// Class / struct names
    pub syntax_class: ThemeColor,
    /// Enum variants
    pub syntax_enum: ThemeColor,
    /// Module / namespace
    pub syntax_module: ThemeColor,
    /// Macros
    pub syntax_macro: ThemeColor,
    /// Attributes / decorators
    pub syntax_attribute: ThemeColor,
    /// Imports / preprocessor
    pub syntax_import: ThemeColor,
    /// Error token
    pub syntax_error: ThemeColor,
    /// Warnings
    pub syntax_warning: ThemeColor,
    /// Tags (HTML/XML)
    pub syntax_tag: ThemeColor,
    /// Attribute names (HTML/XML attributes)
    pub syntax_attribute_name: ThemeColor,
    /// Attribute values
    pub syntax_attribute_value: ThemeColor,

    // ── Bracket colors (rainbow) ────────────────────────────────────────
    /// Cycle through these colors for matching bracket pairs
    pub bracket_colors: Vec<ThemeColor>,

    // ── LSP / diagnostic colors ─────────────────────────────────────────
    pub diagnostic_error: ThemeColor,
    pub diagnostic_warning: ThemeColor,
    pub diagnostic_info: ThemeColor,
    pub diagnostic_hint: ThemeColor,

    /// Underline styles for diagnostics
    pub diagnostic_error_underline: bool,
    pub diagnostic_warning_underline: bool,
    pub diagnostic_info_underline: bool,
}

impl Default for SyntaxTheme {
    fn default() -> Self {
        Self::dark_vscode()
    }
}

impl SyntaxTheme {
    // -- Built-in themes -------------------------------------------------------

    /// VS Code Dark+ inspired theme.
    pub fn dark_vscode() -> Self {
        Self {
            name: "Dark+".into(),
            author: "Grandline".into(),
            dark: true,
            editor_fg: ThemeColor::Rgb(Rgb::new(212, 212, 212)),
            editor_bg: ThemeColor::Rgb(Rgb::new(30, 30, 30)),
            editor_line_number: ThemeColor::Rgb(Rgb::new(85, 85, 85)),
            editor_line_highlight_bg: Some(ThemeColor::Rgb(Rgb::new(42, 42, 42))),
            editor_cursor: ThemeColor::Rgb(Rgb::new(220, 220, 170)),
            editor_selection_bg: ThemeColor::Rgb(Rgb::new(38, 79, 120)),
            editor_bracket_match_bg: Some(ThemeColor::Rgb(Rgb::new(0, 100, 0))),
            editor_bracket_match_border: Some(ThemeColor::Rgb(Rgb::new(147, 147, 147))),
            editor_search_match_bg: Some(ThemeColor::Rgb(Rgb::new(234, 92, 0))),
            editor_search_active_bg: Some(ThemeColor::Rgb(Rgb::new(234, 92, 0))),
            editor_word_wrap_guide: Some(ThemeColor::Rgb(Rgb::new(60, 60, 60))),

            syntax_text: ThemeColor::Rgb(Rgb::new(212, 212, 212)),
            syntax_comment: ThemeColor::Rgb(Rgb::new(87, 166, 74)),
            syntax_keyword: ThemeColor::Rgb(Rgb::new(86, 156, 214)),
            syntax_type: ThemeColor::Rgb(Rgb::new(78, 201, 176)),
            syntax_string: ThemeColor::Rgb(Rgb::new(206, 145, 120)),
            syntax_number: ThemeColor::Rgb(Rgb::new(181, 206, 168)),
            syntax_boolean: ThemeColor::Rgb(Rgb::new(86, 156, 214)),
            syntax_function: ThemeColor::Rgb(Rgb::new(220, 220, 170)),
            syntax_parameter: ThemeColor::Rgb(Rgb::new(220, 220, 170)),
            syntax_variable: ThemeColor::Rgb(Rgb::new(220, 220, 170)),
            syntax_constant: ThemeColor::Rgb(Rgb::new(86, 156, 214)),
            syntax_operator: ThemeColor::Rgb(Rgb::new(212, 212, 212)),
            syntax_punctuation: ThemeColor::Rgb(Rgb::new(212, 212, 212)),
            syntax_class: ThemeColor::Rgb(Rgb::new(78, 201, 176)),
            syntax_enum: ThemeColor::Rgb(Rgb::new(78, 201, 176)),
            syntax_module: ThemeColor::Rgb(Rgb::new(86, 156, 214)),
            syntax_macro: ThemeColor::Rgb(Rgb::new(220, 220, 170)),
            syntax_attribute: ThemeColor::Rgb(Rgb::new(181, 206, 168)),
            syntax_import: ThemeColor::Rgb(Rgb::new(86, 156, 214)),
            syntax_error: ThemeColor::Rgb(Rgb::new(248, 80, 80)),
            syntax_warning: ThemeColor::Rgb(Rgb::new(234, 180, 0)),
            syntax_tag: ThemeColor::Rgb(Rgb::new(86, 156, 214)),
            syntax_attribute_name: ThemeColor::Rgb(Rgb::new(86, 156, 214)),
            syntax_attribute_value: ThemeColor::Rgb(Rgb::new(206, 145, 120)),

            bracket_colors: vec![
                ThemeColor::Rgb(Rgb::new(255, 255, 0)),
                ThemeColor::Rgb(Rgb::new(255, 123, 114)),
                ThemeColor::Rgb(Rgb::new(130, 170, 255)),
                ThemeColor::Rgb(Rgb::new(3, 238, 238)),
                ThemeColor::Rgb(Rgb::new(255, 158, 255)),
                ThemeColor::Rgb(Rgb::new(170, 255, 110)),
            ],

            diagnostic_error: ThemeColor::Rgb(Rgb::new(248, 80, 80)),
            diagnostic_warning: ThemeColor::Rgb(Rgb::new(234, 180, 0)),
            diagnostic_info: ThemeColor::Rgb(Rgb::new(100, 170, 255)),
            diagnostic_hint: ThemeColor::Rgb(Rgb::new(100, 200, 100)),
            diagnostic_error_underline: true,
            diagnostic_warning_underline: true,
            diagnostic_info_underline: false,
        }
    }

    /// Monokai inspired theme.
    pub fn monokai() -> Self {
        Self {
            name: "Monokai".into(),
            author: "Monokai".into(),
            dark: true,
            editor_fg: ThemeColor::Rgb(Rgb::new(248, 248, 242)),
            editor_bg: ThemeColor::Rgb(Rgb::new(39, 40, 34)),
            editor_line_number: ThemeColor::Rgb(Rgb::new(145, 145, 145)),
            editor_line_highlight_bg: Some(ThemeColor::Rgb(Rgb::new(59, 60, 54))),
            editor_cursor: ThemeColor::Rgb(Rgb::new(248, 248, 242)),
            editor_selection_bg: ThemeColor::Rgb(Rgb::new(73, 72, 62)),
            editor_bracket_match_bg: None,
            editor_bracket_match_border: Some(ThemeColor::Rgb(Rgb::new(147, 147, 147))),
            editor_search_match_bg: None,
            editor_search_active_bg: None,
            editor_word_wrap_guide: None,

            syntax_text: ThemeColor::Rgb(Rgb::new(248, 248, 242)),
            syntax_comment: ThemeColor::Rgb(Rgb::new(115, 115, 115)),
            syntax_keyword: ThemeColor::Rgb(Rgb::new(249, 38, 114)),
            syntax_type: ThemeColor::Rgb(Rgb::new(102, 217, 239)),
            syntax_string: ThemeColor::Rgb(Rgb::new(230, 219, 100)),
            syntax_number: ThemeColor::Rgb(Rgb::new(174, 129, 255)),
            syntax_boolean: ThemeColor::Rgb(Rgb::new(174, 129, 255)),
            syntax_function: ThemeColor::Rgb(Rgb::new(166, 226, 46)),
            syntax_parameter: ThemeColor::Rgb(Rgb::new(248, 248, 242)),
            syntax_variable: ThemeColor::Rgb(Rgb::new(248, 248, 242)),
            syntax_constant: ThemeColor::Rgb(Rgb::new(174, 129, 255)),
            syntax_operator: ThemeColor::Rgb(Rgb::new(249, 38, 114)),
            syntax_punctuation: ThemeColor::Rgb(Rgb::new(248, 248, 242)),
            syntax_class: ThemeColor::Rgb(Rgb::new(166, 226, 46)),
            syntax_enum: ThemeColor::Rgb(Rgb::new(102, 217, 239)),
            syntax_module: ThemeColor::Rgb(Rgb::new(249, 38, 114)),
            syntax_macro: ThemeColor::Rgb(Rgb::new(166, 226, 46)),
            syntax_attribute: ThemeColor::Rgb(Rgb::new(249, 38, 114)),
            syntax_import: ThemeColor::Rgb(Rgb::new(249, 38, 114)),
            syntax_error: ThemeColor::Rgb(Rgb::new(248, 80, 80)),
            syntax_warning: ThemeColor::Rgb(Rgb::new(234, 180, 0)),
            syntax_tag: ThemeColor::Rgb(Rgb::new(249, 38, 114)),
            syntax_attribute_name: ThemeColor::Rgb(Rgb::new(166, 226, 46)),
            syntax_attribute_value: ThemeColor::Rgb(Rgb::new(230, 219, 100)),

            bracket_colors: vec![
                ThemeColor::Rgb(Rgb::new(255, 255, 0)),
                ThemeColor::Rgb(Rgb::new(255, 123, 114)),
                ThemeColor::Rgb(Rgb::new(130, 170, 255)),
                ThemeColor::Rgb(Rgb::new(3, 238, 238)),
                ThemeColor::Rgb(Rgb::new(255, 158, 255)),
                ThemeColor::Rgb(Rgb::new(170, 255, 110)),
            ],

            diagnostic_error: ThemeColor::Rgb(Rgb::new(248, 80, 80)),
            diagnostic_warning: ThemeColor::Rgb(Rgb::new(234, 180, 0)),
            diagnostic_info: ThemeColor::Rgb(Rgb::new(100, 170, 255)),
            diagnostic_hint: ThemeColor::Rgb(Rgb::new(100, 200, 100)),
            diagnostic_error_underline: true,
            diagnostic_warning_underline: true,
            diagnostic_info_underline: false,
        }
    }

    /// Solarized Dark theme.
    pub fn solarized_dark() -> Self {
        Self {
            name: "Solarized Dark".into(),
            author: "Ethan Schoonover".into(),
            dark: true,
            editor_fg: ThemeColor::Rgb(Rgb::new(131, 148, 150)),
            editor_bg: ThemeColor::Rgb(Rgb::new(0, 43, 54)),
            editor_line_number: ThemeColor::Rgb(Rgb::new(88, 110, 117)),
            editor_line_highlight_bg: Some(ThemeColor::Rgb(Rgb::new(7, 54, 66))),
            editor_cursor: ThemeColor::Rgb(Rgb::new(220, 50, 47)),
            editor_selection_bg: ThemeColor::Rgb(Rgb::new(7, 54, 66)),
            editor_bracket_match_bg: None,
            editor_bracket_match_border: Some(ThemeColor::Rgb(Rgb::new(88, 110, 117))),
            editor_search_match_bg: None,
            editor_search_active_bg: None,
            editor_word_wrap_guide: None,

            syntax_text: ThemeColor::Rgb(Rgb::new(131, 148, 150)),
            syntax_comment: ThemeColor::Rgb(Rgb::new(88, 110, 117)),
            syntax_keyword: ThemeColor::Rgb(Rgb::new(133, 153, 0)),
            syntax_type: ThemeColor::Rgb(Rgb::new(38, 139, 210)),
            syntax_string: ThemeColor::Rgb(Rgb::new(42, 161, 152)),
            syntax_number: ThemeColor::Rgb(Rgb::new(203, 75, 22)),
            syntax_boolean: ThemeColor::Rgb(Rgb::new(203, 75, 22)),
            syntax_function: ThemeColor::Rgb(Rgb::new(38, 139, 210)),
            syntax_parameter: ThemeColor::Rgb(Rgb::new(131, 148, 150)),
            syntax_variable: ThemeColor::Rgb(Rgb::new(220, 50, 47)),
            syntax_constant: ThemeColor::Rgb(Rgb::new(203, 75, 22)),
            syntax_operator: ThemeColor::Rgb(Rgb::new(133, 153, 0)),
            syntax_punctuation: ThemeColor::Rgb(Rgb::new(131, 148, 150)),
            syntax_class: ThemeColor::Rgb(Rgb::new(38, 139, 210)),
            syntax_enum: ThemeColor::Rgb(Rgb::new(181, 137, 0)),
            syntax_module: ThemeColor::Rgb(Rgb::new(133, 153, 0)),
            syntax_macro: ThemeColor::Rgb(Rgb::new(133, 153, 0)),
            syntax_attribute: ThemeColor::Rgb(Rgb::new(181, 137, 0)),
            syntax_import: ThemeColor::Rgb(Rgb::new(133, 153, 0)),
            syntax_error: ThemeColor::Rgb(Rgb::new(220, 50, 47)),
            syntax_warning: ThemeColor::Rgb(Rgb::new(181, 137, 0)),
            syntax_tag: ThemeColor::Rgb(Rgb::new(133, 153, 0)),
            syntax_attribute_name: ThemeColor::Rgb(Rgb::new(181, 137, 0)),
            syntax_attribute_value: ThemeColor::Rgb(Rgb::new(42, 161, 152)),

            bracket_colors: vec![
                ThemeColor::Rgb(Rgb::new(220, 50, 47)),
                ThemeColor::Rgb(Rgb::new(133, 153, 0)),
                ThemeColor::Rgb(Rgb::new(38, 139, 210)),
                ThemeColor::Rgb(Rgb::new(181, 137, 0)),
                ThemeColor::Rgb(Rgb::new(42, 161, 152)),
                ThemeColor::Rgb(Rgb::new(108, 113, 196)),
            ],

            diagnostic_error: ThemeColor::Rgb(Rgb::new(220, 50, 47)),
            diagnostic_warning: ThemeColor::Rgb(Rgb::new(181, 137, 0)),
            diagnostic_info: ThemeColor::Rgb(Rgb::new(38, 139, 210)),
            diagnostic_hint: ThemeColor::Rgb(Rgb::new(42, 161, 152)),
            diagnostic_error_underline: true,
            diagnostic_warning_underline: true,
            diagnostic_info_underline: false,
        }
    }

    /// Gruvbox Dark theme.
    pub fn gruvbox_dark() -> Self {
        Self {
            name: "Gruvbox Dark".into(),
            author: "Gruvbox".into(),
            dark: true,
            editor_fg: ThemeColor::Rgb(Rgb::new(235, 219, 178)),
            editor_bg: ThemeColor::Rgb(Rgb::new(40, 40, 40)),
            editor_line_number: ThemeColor::Rgb(Rgb::new(124, 111, 100)),
            editor_line_highlight_bg: Some(ThemeColor::Rgb(Rgb::new(50, 48, 47))),
            editor_cursor: ThemeColor::Rgb(Rgb::new(214, 153, 62)),
            editor_selection_bg: ThemeColor::Rgb(Rgb::new(80, 73, 69)),
            editor_bracket_match_bg: None,
            editor_bracket_match_border: Some(ThemeColor::Rgb(Rgb::new(189, 174, 147))),
            editor_search_match_bg: None,
            editor_search_active_bg: None,
            editor_word_wrap_guide: None,

            syntax_text: ThemeColor::Rgb(Rgb::new(235, 219, 178)),
            syntax_comment: ThemeColor::Rgb(Rgb::new(146, 131, 116)),
            syntax_keyword: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_type: ThemeColor::Rgb(Rgb::new(131, 165, 152)),
            syntax_string: ThemeColor::Rgb(Rgb::new(184, 187, 38)),
            syntax_number: ThemeColor::Rgb(Rgb::new(211, 134, 155)),
            syntax_boolean: ThemeColor::Rgb(Rgb::new(211, 134, 155)),
            syntax_function: ThemeColor::Rgb(Rgb::new(131, 165, 152)),
            syntax_parameter: ThemeColor::Rgb(Rgb::new(235, 219, 178)),
            syntax_variable: ThemeColor::Rgb(Rgb::new(235, 219, 178)),
            syntax_constant: ThemeColor::Rgb(Rgb::new(211, 134, 155)),
            syntax_operator: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_punctuation: ThemeColor::Rgb(Rgb::new(235, 219, 178)),
            syntax_class: ThemeColor::Rgb(Rgb::new(131, 165, 152)),
            syntax_enum: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_module: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_macro: ThemeColor::Rgb(Rgb::new(131, 165, 152)),
            syntax_attribute: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_import: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_error: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_warning: ThemeColor::Rgb(Rgb::new(214, 153, 62)),
            syntax_tag: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            syntax_attribute_name: ThemeColor::Rgb(Rgb::new(214, 153, 62)),
            syntax_attribute_value: ThemeColor::Rgb(Rgb::new(184, 187, 38)),

            bracket_colors: vec![
                ThemeColor::Rgb(Rgb::new(250, 189, 47)),
                ThemeColor::Rgb(Rgb::new(184, 187, 38)),
                ThemeColor::Rgb(Rgb::new(131, 165, 152)),
                ThemeColor::Rgb(Rgb::new(211, 134, 155)),
                ThemeColor::Rgb(Rgb::new(214, 153, 62)),
                ThemeColor::Rgb(Rgb::new(142, 192, 124)),
            ],

            diagnostic_error: ThemeColor::Rgb(Rgb::new(250, 189, 47)),
            diagnostic_warning: ThemeColor::Rgb(Rgb::new(214, 153, 62)),
            diagnostic_info: ThemeColor::Rgb(Rgb::new(131, 165, 152)),
            diagnostic_hint: ThemeColor::Rgb(Rgb::new(142, 192, 124)),
            diagnostic_error_underline: true,
            diagnostic_warning_underline: true,
            diagnostic_info_underline: false,
        }
    }

    /// Light theme (default for light mode).
    pub fn light_default() -> Self {
        Self {
            name: "Default Light".into(),
            author: "Grandline".into(),
            dark: false,
            editor_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            editor_bg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            editor_line_number: ThemeColor::Rgb(Rgb::new(170, 170, 170)),
            editor_line_highlight_bg: Some(ThemeColor::Rgb(Rgb::new(245, 245, 245))),
            editor_cursor: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            editor_selection_bg: ThemeColor::Rgb(Rgb::new(173, 214, 255)),
            editor_bracket_match_bg: Some(ThemeColor::Rgb(Rgb::new(200, 200, 200))),
            editor_bracket_match_border: Some(ThemeColor::Rgb(Rgb::new(170, 170, 170))),
            editor_search_match_bg: Some(ThemeColor::Rgb(Rgb::new(255, 220, 120))),
            editor_search_active_bg: Some(ThemeColor::Rgb(Rgb::new(255, 180, 50))),
            editor_word_wrap_guide: Some(ThemeColor::Rgb(Rgb::new(220, 220, 220))),

            syntax_text: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            syntax_comment: ThemeColor::Rgb(Rgb::new(0, 128, 0)),
            syntax_keyword: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_type: ThemeColor::Rgb(Rgb::new(43, 145, 175)),
            syntax_string: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_number: ThemeColor::Rgb(Rgb::new(9, 134, 88)),
            syntax_boolean: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_function: ThemeColor::Rgb(Rgb::new(136, 19, 145)),
            syntax_parameter: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            syntax_variable: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            syntax_constant: ThemeColor::Rgb(Rgb::new(9, 134, 88)),
            syntax_operator: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            syntax_punctuation: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            syntax_class: ThemeColor::Rgb(Rgb::new(43, 145, 175)),
            syntax_enum: ThemeColor::Rgb(Rgb::new(43, 145, 175)),
            syntax_module: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_macro: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_attribute: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_import: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_error: ThemeColor::Rgb(Rgb::new(220, 50, 47)),
            syntax_warning: ThemeColor::Rgb(Rgb::new(181, 137, 0)),
            syntax_tag: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_attribute_name: ThemeColor::Rgb(Rgb::new(163, 21, 21)),
            syntax_attribute_value: ThemeColor::Rgb(Rgb::new(163, 21, 21)),

            bracket_colors: vec![
                ThemeColor::Rgb(Rgb::new(0, 0, 180)),
                ThemeColor::Rgb(Rgb::new(180, 0, 0)),
                ThemeColor::Rgb(Rgb::new(0, 150, 0)),
                ThemeColor::Rgb(Rgb::new(180, 0, 180)),
                ThemeColor::Rgb(Rgb::new(0, 150, 150)),
                ThemeColor::Rgb(Rgb::new(180, 120, 0)),
            ],

            diagnostic_error: ThemeColor::Rgb(Rgb::new(220, 50, 47)),
            diagnostic_warning: ThemeColor::Rgb(Rgb::new(181, 137, 0)),
            diagnostic_info: ThemeColor::Rgb(Rgb::new(38, 139, 210)),
            diagnostic_hint: ThemeColor::Rgb(Rgb::new(0, 150, 150)),
            diagnostic_error_underline: true,
            diagnostic_warning_underline: true,
            diagnostic_info_underline: false,
        }
    }

    // -- Persistence -----------------------------------------------------------

    /// Load a theme from a JSON file.
    pub fn load(path: &Path) -> Option<Self> {
        let content = fs::read_to_string(path).ok()?;
        serde_json::from_str(&content).ok()
    }

    /// Save the theme to a JSON file.
    pub fn save(&self, path: &Path) -> std::io::Result<()> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)
    }

    /// Get the bracket color at a given nesting depth.
    pub fn bracket_color(&self, depth: usize) -> Rgb {
        let idx = depth % self.bracket_colors.len();
        self.bracket_colors[idx].rgb()
    }
}

// ---------------------------------------------------------------------------
// UI chrome colors
// ---------------------------------------------------------------------------

/// Colors for UI chrome elements (panels, tab bar, dialogs, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIColors {
    /// Panel background
    pub panel_bg: ThemeColor,
    /// Panel border
    pub panel_border: ThemeColor,
    /// Tab bar background
    pub tab_bar_bg: ThemeColor,
    /// Active tab background
    pub tab_active_bg: ThemeColor,
    /// Inactive tab background
    pub tab_inactive_bg: ThemeColor,
    /// Active tab foreground
    pub tab_active_fg: ThemeColor,
    /// Inactive tab foreground
    pub tab_inactive_fg: ThemeColor,
    /// Tab bar bottom border
    pub tab_bar_border: ThemeColor,
    /// Status bar background (see StatusTheme for more detail)
    pub status_bar_bg: ThemeColor,
    /// Status bar foreground
    pub status_bar_fg: ThemeColor,
    /// Gutter background
    pub gutter_bg: ThemeColor,
    /// Gutter foreground
    pub gutter_fg: ThemeColor,
    /// Scrollbar thumb
    pub scrollbar_thumb: ThemeColor,
    /// Scrollbar track
    pub scrollbar_track: ThemeColor,
    /// Minimap background
    pub minimap_bg: ThemeColor,
    /// Minimap slider
    pub minimap_slider: ThemeColor,
    /// Dialog background
    pub dialog_bg: ThemeColor,
    /// Dialog border
    pub dialog_border: ThemeColor,
    /// Dialog foreground
    pub dialog_fg: ThemeColor,
    /// Button primary background
    pub button_primary_bg: ThemeColor,
    /// Button primary foreground
    pub button_primary_fg: ThemeColor,
    /// Button secondary background
    pub button_secondary_bg: ThemeColor,
    /// Button secondary foreground
    pub button_secondary_fg: ThemeColor,
    /// Input field background
    pub input_bg: ThemeColor,
    /// Input field border
    pub input_border: ThemeColor,
    /// Input field foreground
    pub input_fg: ThemeColor,
    /// Input field placeholder
    pub input_placeholder: ThemeColor,
    /// Drop shadow (not a color, but a flag for the renderer)
    pub show_drop_shadow: bool,
}

impl Default for UIColors {
    fn default() -> Self {
        Self::dark()
    }
}

impl UIColors {
    pub fn dark() -> Self {
        Self {
            panel_bg: ThemeColor::Rgb(Rgb::new(30, 30, 30)),
            panel_border: ThemeColor::Rgb(Rgb::new(60, 60, 60)),
            tab_bar_bg: ThemeColor::Rgb(Rgb::new(37, 37, 38)),
            tab_active_bg: ThemeColor::Rgb(Rgb::new(30, 30, 30)),
            tab_inactive_bg: ThemeColor::Rgb(Rgb::new(45, 45, 48)),
            tab_active_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            tab_inactive_fg: ThemeColor::Rgb(Rgb::new(150, 150, 150)),
            tab_bar_border: ThemeColor::Rgb(Rgb::new(60, 60, 60)),
            status_bar_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            status_bar_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            gutter_bg: ThemeColor::Rgb(Rgb::new(30, 30, 30)),
            gutter_fg: ThemeColor::Rgb(Rgb::new(85, 85, 85)),
            scrollbar_thumb: ThemeColor::Rgb(Rgb::new(78, 78, 78)),
            scrollbar_track: ThemeColor::Rgb(Rgb::new(30, 30, 30)),
            minimap_bg: ThemeColor::Rgb(Rgb::new(30, 30, 30)),
            minimap_slider: ThemeColor::Rgb(Rgb::new(80, 80, 80)),
            dialog_bg: ThemeColor::Rgb(Rgb::new(37, 37, 38)),
            dialog_border: ThemeColor::Rgb(Rgb::new(60, 60, 60)),
            dialog_fg: ThemeColor::Rgb(Rgb::new(204, 204, 204)),
            button_primary_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            button_primary_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            button_secondary_bg: ThemeColor::Rgb(Rgb::new(60, 60, 60)),
            button_secondary_fg: ThemeColor::Rgb(Rgb::new(204, 204, 204)),
            input_bg: ThemeColor::Rgb(Rgb::new(60, 60, 60)),
            input_border: ThemeColor::Rgb(Rgb::new(80, 80, 80)),
            input_fg: ThemeColor::Rgb(Rgb::new(204, 204, 204)),
            input_placeholder: ThemeColor::Rgb(Rgb::new(120, 120, 120)),
            show_drop_shadow: true,
        }
    }

    pub fn light() -> Self {
        Self {
            panel_bg: ThemeColor::Rgb(Rgb::new(245, 245, 245)),
            panel_border: ThemeColor::Rgb(Rgb::new(200, 200, 200)),
            tab_bar_bg: ThemeColor::Rgb(Rgb::new(220, 220, 220)),
            tab_active_bg: ThemeColor::Rgb(Rgb::new(245, 245, 245)),
            tab_inactive_bg: ThemeColor::Rgb(Rgb::new(220, 220, 220)),
            tab_active_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            tab_inactive_fg: ThemeColor::Rgb(Rgb::new(100, 100, 100)),
            tab_bar_border: ThemeColor::Rgb(Rgb::new(200, 200, 200)),
            status_bar_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            status_bar_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            gutter_bg: ThemeColor::Rgb(Rgb::new(245, 245, 245)),
            gutter_fg: ThemeColor::Rgb(Rgb::new(170, 170, 170)),
            scrollbar_thumb: ThemeColor::Rgb(Rgb::new(190, 190, 190)),
            scrollbar_track: ThemeColor::Rgb(Rgb::new(245, 245, 245)),
            minimap_bg: ThemeColor::Rgb(Rgb::new(245, 245, 245)),
            minimap_slider: ThemeColor::Rgb(Rgb::new(200, 200, 200)),
            dialog_bg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            dialog_border: ThemeColor::Rgb(Rgb::new(200, 200, 200)),
            dialog_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            button_primary_bg: ThemeColor::Rgb(Rgb::new(0, 122, 204)),
            button_primary_fg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            button_secondary_bg: ThemeColor::Rgb(Rgb::new(230, 230, 230)),
            button_secondary_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            input_bg: ThemeColor::Rgb(Rgb::new(255, 255, 255)),
            input_border: ThemeColor::Rgb(Rgb::new(200, 200, 200)),
            input_fg: ThemeColor::Rgb(Rgb::new(51, 51, 51)),
            input_placeholder: ThemeColor::Rgb(Rgb::new(170, 170, 170)),
            show_drop_shadow: false,
        }
    }
}

// ---------------------------------------------------------------------------
// Combined theme
// ---------------------------------------------------------------------------

/// A complete theme combining syntax highlighting and UI chrome.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    /// Syntax highlighting theme
    pub syntax: SyntaxTheme,
    /// UI chrome colors
    pub ui: UIColors,
}

impl Default for Theme {
    fn default() -> Self {
        Self::dark_vscode()
    }
}

impl Theme {
    pub fn dark_vscode() -> Self {
        Self {
            syntax: SyntaxTheme::dark_vscode(),
            ui: UIColors::dark(),
        }
    }

    pub fn monokai() -> Self {
        Self {
            syntax: SyntaxTheme::monokai(),
            ui: UIColors::dark(),
        }
    }

    pub fn solarized_dark() -> Self {
        Self {
            syntax: SyntaxTheme::solarized_dark(),
            ui: UIColors::dark(),
        }
    }

    pub fn gruvbox_dark() -> Self {
        Self {
            syntax: SyntaxTheme::gruvbox_dark(),
            ui: UIColors::dark(),
        }
    }

    pub fn light() -> Self {
        Self {
            syntax: SyntaxTheme::light_default(),
            ui: UIColors::light(),
        }
    }

    /// Load from a JSON file (both syntax + ui).
    pub fn load(path: &Path) -> Option<Self> {
        let content = fs::read_to_string(path).ok()?;
        serde_json::from_str(&content).ok()
    }

    /// Save to a JSON file.
    pub fn save(&self, path: &Path) -> std::io::Result<()> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)
    }
}

// ---------------------------------------------------------------------------
// Theme manager – manages available themes and the active theme
// ---------------------------------------------------------------------------

pub struct ThemeManager {
    /// Built-in themes (always available)
    builtins: Vec<Theme>,
    /// Custom themes loaded from disk
    custom_themes: Vec<Theme>,
    /// Directory for custom themes
    themes_dir: PathBuf,
    /// Currently active theme
    active: Theme,
    /// Active theme name
    active_name: String,
}

impl ThemeManager {
    pub fn new(themes_dir: PathBuf) -> Self {
        let builtins = vec![
            Theme::dark_vscode(),
            Theme::monokai(),
            Theme::solarized_dark(),
            Theme::gruvbox_dark(),
            Theme::light(),
        ];

        let active_name = "Dark+".into();
        let active = builtins[0].clone();

        let mut manager = Self {
            builtins,
            custom_themes: Vec::new(),
            themes_dir,
            active,
            active_name,
        };

        // Load custom themes from disk
        manager.load_custom_themes();
        manager
    }

    /// Get the active theme.
    pub fn active(&self) -> &Theme {
        &self.active
    }

    /// Get the active theme name.
    pub fn active_name(&self) -> &str {
        &self.active_name
    }

    /// Get a reference to the syntax theme of the active theme.
    pub fn syntax(&self) -> &SyntaxTheme {
        &self.active.syntax
    }

    /// Get a reference to the UI colors of the active theme.
    pub fn ui(&self) -> &UIColors {
        &self.active.ui
    }

    /// Set the active theme by name.
    pub fn set_active(&mut self, name: &str) -> bool {
        // Check builtins
        if let Some(theme) = self.builtins.iter().find(|t| t.syntax.name == name) {
            self.active = theme.clone();
            self.active_name = name.to_string();
            return true;
        }
        // Check custom
        if let Some(theme) = self.custom_themes.iter().find(|t| t.syntax.name == name) {
            self.active = theme.clone();
            self.active_name = name.to_string();
            return true;
        }
        false
    }

    /// List all available theme names.
    pub fn list_themes(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self
            .builtins
            .iter()
            .map(|t| t.syntax.name.as_str())
            .collect();
        names.extend(
            self.custom_themes
                .iter()
                .map(|t| t.syntax.name.as_str()),
        );
        names
    }

    /// Import a theme from a file path.
    pub fn import_theme(&mut self, path: &Path) -> Option<String> {
        let theme = Theme::load(path)?;
        let name = theme.syntax.name.clone();
        self.custom_themes.push(theme);
        Some(name)
    }

    /// Export the current active theme to a file.
    pub fn export_active(&self, path: &Path) -> std::io::Result<()> {
        self.active.save(path)
    }

    /// Save a custom theme to the themes directory.
    pub fn save_custom_theme(&self, theme: &Theme) -> std::io::Result<()> {
        let filename = format!(
            "{}.json",
            theme.syntax.name.to_lowercase().replace(' ', "_")
        );
        let path = self.themes_dir.join(filename);
        theme.save(&path)
    }

    /// Load custom themes from the themes directory.
    fn load_custom_themes(&mut self) {
        if !self.themes_dir.exists() {
            let _ = fs::create_dir_all(&self.themes_dir);
            return;
        }

        if let Ok(entries) = fs::read_dir(&self.themes_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("json") {
                    if let Some(theme) = Theme::load(&path) {
                        self.custom_themes.push(theme);
                    }
                }
            }
        }
    }

    /// Reload custom themes from disk.
    pub fn reload(&mut self) {
        self.custom_themes.clear();
        self.load_custom_themes();
    }

    /// Delete a custom theme by name.
    pub fn delete_custom(&mut self, name: &str) -> bool {
        let idx = self
            .custom_themes
            .iter()
            .position(|t| t.syntax.name == name);
        if let Some(idx) = idx {
            let theme = &self.custom_themes[idx];
            let filename = format!(
                "{}.json",
                theme.syntax.name.to_lowercase().replace(' ', "_")
            );
            let path = self.themes_dir.join(filename);
            let _ = fs::remove_file(path);
            self.custom_themes.remove(idx);
            true
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rgb_hex_roundtrip() {
        let rgb = Rgb::new(255, 128, 0);
        let hex = rgb.to_hex();
        assert_eq!(hex, "#ff8000");
        let parsed = Rgb::from_hex(&hex).unwrap();
        assert_eq!(parsed, rgb);
    }

    #[test]
    fn test_theme_color_rgb() {
        let c = ThemeColor::Named("red".into());
        let rgb = c.rgb();
        assert_eq!(rgb, Rgb::new(205, 49, 49));
    }

    #[test]
    fn test_bracket_color_cycling() {
        let theme = SyntaxTheme::dark_vscode();
        let c0 = theme.bracket_color(0);
        let c1 = theme.bracket_color(1);
        let c6 = theme.bracket_color(6); // should wrap to c0
        assert_ne!(c0, c1);
        assert_eq!(c0, c6);
    }

    #[test]
    fn test_theme_manager() {
        let mut manager = ThemeManager::new(PathBuf::from("/tmp/test_themes"));
        let themes = manager.list_themes();
        assert!(themes.contains(&"Dark+"));
        assert!(themes.contains(&"Monokai"));
        assert!(themes.contains(&"Solarized Dark"));

        assert!(manager.set_active("Monokai"));
        assert_eq!(manager.active_name(), "Monokai");

        assert!(!manager.set_active("Nonexistent"));
        assert_eq!(manager.active_name(), "Monokai"); // unchanged
    }
}
