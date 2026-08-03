//! UI module – all user interface components for the editor.

pub mod keyboard;
pub mod input;
pub mod status;
pub mod panels;
pub mod theme;
pub mod dialog;

// Re-exports for convenient importing
pub use keyboard::{
    EditorAction, KeyBinding, KeyBindingManager, KeyCombo, KeyCode, KeyMap, Modifiers,
    key_event_to_combo,
};

pub use input::{
    EditorMode, InputAction, InputHandler, MouseAction, MouseButton, MousePosition,
    TextBuffer,
};

pub use status::{
    StatusBar, StatusBarHitTest, StatusBarState, StatusColor, StatusItem, StatusMessage,
    StatusMessageKind, StatusMode, StatusTheme,
};

pub use panels::{
    Panel, PanelId, PanelManager, PanelNode, Rect, SplitDirection, Tab,
};

pub use theme::{
    DialogTheme, Rgb, SyntaxTheme, Theme, ThemeColor, ThemeManager, UIColors,
};

pub use dialog::{
    AboutDialog, ConfirmDialog, Dialog, DialogAction, DialogButton, DialogInput,
    DialogKey, DialogManager, DialogRenderOutput, DialogTheme, InputDialog,
};

// ---------------------------------------------------------------------------
// UI system initialization
// ---------------------------------------------------------------------------

use std::path::PathBuf;

/// Initialize all UI subsystems with a configuration directory.
pub fn init_ui(config_dir: PathBuf) -> UIContext {
    let keybinding_manager = crate::ui::keyboard::KeyBindingManager::new(config_dir.clone());
    let input_handler = crate::ui::input::InputHandler::new(keybinding_manager);
    let theme_manager = crate::ui::theme::ThemeManager::new(config_dir.join("themes"));

    UIContext {
        input_handler,
        theme_manager,
    }
}

/// Holds the main UI subsystems for easy access.
pub struct UIContext {
    pub input_handler: crate::ui::input::InputHandler,
    pub theme_manager: crate::ui::theme::ThemeManager,
}

impl UIContext {
    /// Process a character input through the input handler.
    pub fn process_char(
        &mut self,
        ch: char,
        modifiers: crate::ui::keyboard::Modifiers,
    ) -> Vec<crate::ui::input::InputAction> {
        self.input_handler.process_char(ch, modifiers)
    }

    /// Process a key event through the input handler.
    pub fn process_key(
        &mut self,
        key: crate::ui::keyboard::KeyCode,
        modifiers: crate::ui::keyboard::Modifiers,
    ) -> Vec<crate::ui::input::InputAction> {
        self.input_handler.process_key(key, modifiers)
    }

    /// Process a mouse event.
    pub fn process_mouse(
        &mut self,
        action: crate::ui::input::MouseAction,
    ) -> Vec<crate::ui::input::InputAction> {
        self.input_handler.process_mouse(action)
    }

    /// Get the current editor mode.
    pub fn mode(&self) -> crate::ui::input::EditorMode {
        self.input_handler.mode()
    }

    /// Switch editor mode.
    pub fn set_mode(&mut self, mode: crate::ui::input::EditorMode) {
        self.input_handler.switch_mode(mode);
    }

    /// Get the active theme.
    pub fn theme(&self) -> &crate::ui::theme::Theme {
        self.theme_manager.active()
    }

    /// Get the active syntax theme.
    pub fn syntax_theme(&self) -> &crate::ui::theme::SyntaxTheme {
        self.theme_manager.syntax()
    }

    /// Get the active UI colors.
    pub fn ui_colors(&self) -> &crate::ui::theme::UIColors {
        self.theme_manager.ui()
    }
}