use std::collections::HashMap;

// ---------------------------------------------------------------------------
// Panel layout types
// ---------------------------------------------------------------------------

/// How a split panel is arranged relative to its parent.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SplitDirection {
    /// Panels stacked vertically (split side by side horizontally)
    Horizontal,
    /// Panels stacked horizontally (split one above the other)
    Vertical,
}

impl SplitDirection {
    pub fn label(&self) -> &str {
        match self {
            SplitDirection::Horizontal => "H",
            SplitDirection::Vertical => "V",
        }
    }
}

/// Rectangular region on screen.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Rect {
    pub x: u16,
    pub y: u16,
    pub width: u16,
    pub height: u16,
}

impl Rect {
    pub fn new(x: u16, y: u16, width: u16, height: u16) -> Self {
        Self {
            x,
            y,
            width,
            height,
        }
    }

    pub fn contains(&self, x: u16, y: u16) -> bool {
        x >= self.x && x < self.x + self.width && y >= self.y && y < self.y + self.height
    }
}

// ---------------------------------------------------------------------------
// Tab bar
// ---------------------------------------------------------------------------

/// Represents a single open tab in a panel.
#[derive(Debug, Clone)]
pub struct Tab {
    pub id: u64,
    /// Display title
    pub title: String,
    /// Tooltip
    pub tooltip: Option<String>,
    /// Whether the tab is pinned (can't be closed with regular close)
    pub pinned: bool,
    /// Whether the tab's file has unsaved changes
    pub dirty: bool,
    /// Associated buffer/file path
    pub path: Option<String>,
    /// Icon (optional)
    pub icon: Option<String>,
}

impl Tab {
    pub fn new(id: u64, title: impl Into<String>) -> Self {
        Self {
            id,
            title: title.into(),
            tooltip: None,
            pinned: false,
            dirty: false,
            path: None,
            icon: None,
        }
    }

    /// Display title including dirty indicator.
    pub fn display_title(&self) -> String {
        if self.dirty {
            format!("● {}", self.title)
        } else {
            self.title.clone()
        }
    }
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct PanelId(pub usize);

/// A leaf panel containing a buffer and tabs.
#[derive(Debug, Clone)]
pub struct Panel {
    pub id: PanelId,
    /// Tabs in this panel (topmost = active)
    pub tabs: Vec<Tab>,
    /// Index of the active tab
    pub active_tab: usize,
    /// The panel's layout area
    pub rect: Rect,
    /// Scroll offset for the content
    pub scroll_offset: u16,
    /// Whether this panel is currently focused
    pub focused: bool,
}

impl Panel {
    pub fn new(id: PanelId, rect: Rect) -> Self {
        Self {
            id,
            tabs: Vec::new(),
            active_tab: 0,
            rect,
            scroll_offset: 0,
            focused: false,
        }
    }

    pub fn active_tab(&self) -> Option<&Tab> {
        self.tabs.get(self.active_tab)
    }

    pub fn add_tab(&mut self, tab: Tab) {
        // If tab already exists, just focus it
        if let Some(idx) = self.tabs.iter().position(|t| t.id == tab.id) {
            self.active_tab = idx;
            return;
        }
        self.tabs.push(tab);
        self.active_tab = self.tabs.len() - 1;
    }

    pub fn close_tab(&mut self, tab_id: u64) {
        let idx = self.tabs.iter().position(|t| t.id == tab_id);
        if let Some(idx) = idx {
            // Only close if not pinned
            if self.tabs[idx].pinned {
                return;
            }
            self.tabs.remove(idx);
            if self.active_tab >= self.tabs.len() && !self.tabs.is_empty() {
                self.active_tab = self.tabs.len() - 1;
            }
        }
    }

    pub fn next_tab(&mut self) {
        if self.tabs.is_empty() {
            return;
        }
        self.active_tab = (self.active_tab + 1) % self.tabs.len();
    }

    pub fn previous_tab(&mut self) {
        if self.tabs.is_empty() {
            return;
        }
        self.active_tab = if self.active_tab == 0 {
            self.tabs.len() - 1
        } else {
            self.active_tab - 1
        };
    }

    /// Get the content area rect (excluding tab bar and other chrome).
    pub fn content_rect(&self, tab_bar_height: u16) -> Rect {
        Rect::new(
            self.rect.x,
            self.rect.y + tab_bar_height,
            self.rect.width,
            self.rect.height.saturating_sub(tab_bar_height),
        )
    }
}

// ---------------------------------------------------------------------------
// Panel node – tree structure for split panels
// ---------------------------------------------------------------------------

/// A node in the panel layout tree.
pub enum PanelNode {
    /// A leaf panel
    Panel(Box<Panel>),
    /// A split containing child nodes
    Split {
        /// Direction of the split
        direction: SplitDirection,
        /// Child nodes
        children: Vec<PanelNode>,
        /// Split ratios (0.0 - 1.0, sums to 1.0 for the children)
        ratios: Vec<f64>,
        /// Whether the split is currently collapsed
        collapsed: bool,
    },
}

impl PanelNode {
    /// Recursively collect all panels in this tree.
    pub fn collect_panels(&self, out: &mut Vec<&Panel>) {
        match self {
            PanelNode::Panel(p) => out.push(p),
            PanelNode::Split { children, .. } => {
                for child in children {
                    child.collect_panels(out);
                }
            }
        }
    }

    /// Recursively collect all panels mutably.
    pub fn collect_panels_mut(&mut self, out: &mut Vec<&mut Panel>) {
        match self {
            PanelNode::Panel(p) => out.push(p),
            PanelNode::Split { children, .. } => {
                for child in children {
                    child.collect_panels_mut(out);
                }
            }
        }
    }

    /// Find a panel by id.
    pub fn find_panel(&mut self, id: &PanelId) -> Option<&mut Panel> {
        match self {
            PanelNode::Panel(p) => {
                if p.id == *id {
                    Some(p)
                } else {
                    None
                }
            }
            PanelNode::Split { children, .. } => {
                for child in children {
                    if let Some(found) = child.find_panel(id) {
                        return Some(found);
                    }
                }
                None
            }
        }
    }

    /// Count the number of leaf panels.
    pub fn panel_count(&self) -> usize {
        let mut count = 0;
        self.collect_panels(&mut Vec::new()).len()
    }
}

// ---------------------------------------------------------------------------
// Panel manager – top-level layout management
// ---------------------------------------------------------------------------

pub struct PanelManager {
    /// Root of the panel tree
    root: Option<PanelNode>,
    /// Next panel id
    next_panel_id: PanelId,
    /// Next tab id
    next_tab_id: u64,
    /// Terminal dimensions (for default layout)
    terminal_width: u16,
    terminal_height: u16,
    /// Tab bar height
    tab_bar_height: u16,
    /// Status bar height (reserved at the bottom)
    status_bar_height: u16,
    /// Map of focused panel by panel id
    focused_panel: Option<PanelId>,
}

impl PanelManager {
    pub fn new() -> Self {
        Self {
            root: None,
            next_panel_id: PanelId(1),
            next_tab_id: 1,
            terminal_width: 80,
            terminal_height: 24,
            tab_bar_height: 1,
            status_bar_height: 1,
            focused_panel: None,
        }
    }

    // -- Setup ----------------------------------------------------------------

    /// Update terminal size and recompute layout.
    pub fn set_terminal_size(&mut self, width: u16, height: u16) {
        self.terminal_width = width;
        self.terminal_height = height;
        self.recompute_layout();
    }

    /// Set the tab bar height.
    pub fn set_tab_bar_height(&mut self, h: u16) {
        self.tab_bar_height = h;
        self.recompute_layout();
    }

    /// Set the status bar height.
    pub fn set_status_bar_height(&mut self, h: u16) {
        self.status_bar_height = h;
        self.recompute_layout();
    }

    /// Initialize the default layout with a single panel.
    pub fn init_default_layout(&mut self) {
        if self.root.is_none() {
            let rect = self.available_rect();
            let panel = Panel::new(self.next_panel_id.clone(), rect);
            self.next_panel_id = PanelId(self.next_panel_id.0 + 1);
            self.focused_panel = Some(panel.id);
            self.root = Some(PanelNode::Panel(Box::new(panel)));
        }
    }

    /// The rect available to the panel area (excluding status bar).
    fn available_rect(&self) -> Rect {
        let height = self.terminal_height.saturating_sub(self.status_bar_height);
        Rect::new(0, 0, self.terminal_width, height)
    }

    /// Recompute all panel rects based on the tree and terminal size.
    pub fn recompute_layout(&mut self) {
        let total_rect = self.available_rect();
        if let Some(root) = self.root.as_mut() {
            Self::layout_node(root, &total_rect, self.tab_bar_height);
        }
    }

    /// Recursively layout a node into the given rect.
    fn layout_node(node: &mut PanelNode, rect: &Rect, tab_bar_height: u16) {
        match node {
            PanelNode::Panel(panel) => {
                panel.rect = *rect;
            }
            PanelNode::Split {
                direction,
                children,
                ratios,
                ..
            } => {
                let n = children.len();
                if n == 0 {
                    return;
                }

                // Normalize ratios to sum to 1.0
                let total: f64 = ratios.iter().sum();
                let normalized: Vec<f64> = if total > 0.0 {
                    ratios.iter().map(|r| r / total).collect()
                } else {
                    vec![1.0 / n as f64; n]
                };

                match direction {
                    SplitDirection::Horizontal => {
                        // Children side by side
                        let available = rect.width as f64;
                        let mut x = rect.x;
                        for (i, (child, ratio)) in
                            children.iter_mut().zip(normalized.iter()).enumerate()
                        {
                            let w = if i == n - 1 {
                                rect.width.saturating_sub(x.saturating_sub(rect.x))
                            } else {
                                (available * ratio).max(1.0) as u16
                            };
                            let child_rect = Rect::new(x, rect.y, w, rect.height);
                            Self::layout_node(child, &child_rect, tab_bar_height);
                            x = x.saturating_add(w);
                        }
                    }
                    SplitDirection::Vertical => {
                        // Children stacked vertically
                        let available = rect.height as f64;
                        let mut y = rect.y;
                        for (i, (child, ratio)) in
                            children.iter_mut().zip(normalized.iter()).enumerate()
                        {
                            let h = if i == n - 1 {
                                rect.height.saturating_sub(y.saturating_sub(rect.y))
                            } else {
                                (available * ratio).max(1.0) as u16
                            };
                            let child_rect = Rect::new(rect.x, y, rect.width, h);
                            Self::layout_node(child, &child_rect, tab_bar_height);
                            y = y.saturating_add(h);
                        }
                    }
                }
            }
        }
    }

    // -- Panel operations ------------------------------------------------------

    /// Split the focused panel, creating a new panel.
    pub fn split(&mut self, direction: SplitDirection) {
        self.init_default_layout();

        let focused = self.focused_panel;
        let root = self.root.as_mut();
        let _ = root;

        // Find the focused panel's rect
        let mut focused_rect = None;
        let mut collect = Vec::new();
        if let Some(root_node) = self.root.as_mut() {
            root_node.collect_panels_mut(&mut collect);
        }
        for panel in &collect {
            if panel.id == focused.unwrap_or(PanelId(0)) {
                focused_rect = Some(panel.rect);
            }
        }

        let rect = focused_rect.unwrap_or(self.available_rect());
        let new_panel = Panel::new(self.next_panel_id.clone(), rect);
        self.next_panel_id = PanelId(self.next_panel_id.0 + 1);

        // Add the new panel as a sibling of the focused one
        self.insert_panel_at_focused(direction, new_panel);
    }

    /// Insert a new panel as a sibling of the focused panel.
    fn insert_panel_at_focused(&mut self, direction: SplitDirection, new_panel: Panel) {
        let focused = self.focused_panel;

        // Create a new split node containing the focused panel and the new panel
        let root = self.root.take();
        let mut new_root = match root {
            Some(PanelNode::Panel(panel)) if panel.id == focused.unwrap_or(PanelId(0)) => {
                PanelNode::Split {
                    direction,
                    children: vec![
                        PanelNode::Panel(panel),
                        PanelNode::Panel(Box::new(new_panel)),
                    ],
                    ratios: vec![0.5, 0.5],
                    collapsed: false,
                }
            }
            Some(other) => {
                // Need to find the focused panel inside a tree
                let mut tree = other;
                Self::insert_sibling(&mut tree, &focused.unwrap_or(PanelId(0)), direction, new_panel);
                tree
            }
            None => {
                let panel = Panel::new(self.next_panel_id.clone(), self.available_rect());
                self.next_panel_id = PanelId(self.next_panel_id.0 + 1);
                PanelNode::Panel(Box::new(panel))
            }
        };

        self.focused_panel = Some(new_panel.id);
        self.root = Some(new_root);
        self.recompute_layout();
    }

    /// Recursively insert a sibling panel for the panel with the given id.
    fn insert_sibling(
        node: &mut PanelNode,
        target_id: &PanelId,
        direction: SplitDirection,
        new_panel: Panel,
    ) {
        match node {
            PanelNode::Panel(panel) if panel.id == *target_id => {
                let old_panel = std::mem::replace(panel, Panel::new(*target_id, Rect::new(0, 0, 0, 0)));
                let old_node = PanelNode::Panel(Box::new(old_panel));
                let new_node = PanelNode::Panel(Box::new(new_panel.clone()));
                *node = PanelNode::Split {
                    direction,
                    children: vec![old_node, new_node],
                    ratios: vec![0.5, 0.5],
                    collapsed: false,
                };
            }
            PanelNode::Split { children, .. } => {
                for child in children {
                    Self::insert_sibling(child, target_id, direction, new_panel.clone());
                }
            }
            _ => {}
        }
    }

    /// Close the focused panel.
    pub fn close_panel(&mut self) {
        let focused = self.focused_panel;
        if focused.is_none() {
            return;
        }

        // Remove the panel from the tree
        if let Some(root) = self.root.as_mut() {
            Self::remove_panel(root, &focused.unwrap());
        }

        // Refocus another panel
        self.focus_next_panel();
    }

    /// Recursively remove a panel by id. If a split becomes empty, remove it.
    fn remove_panel(node: &mut PanelNode, target_id: &PanelId) -> bool {
        match node {
            PanelNode::Panel(panel) => panel.id == *target_id,
            PanelNode::Split {
                children, ratios, ..
            } => {
                let mut removed = false;
                let mut i = 0;
                while i < children.len() {
                    let child = &mut children[i];
                    if Self::remove_panel(child, target_id) {
                        children.remove(i);
                        if i < ratios.len() {
                            ratios.remove(i);
                        }
                        removed = true;
                    } else {
                        i += 1;
                    }
                }
                removed
            }
        }
    }

    /// Focus the next panel (circular).
    pub fn focus_next_panel(&mut self) {
        let mut panels: Vec<PanelId> = Vec::new();
        let mut collect: Vec<&mut Panel> = Vec::new();
        if let Some(root) = self.root.as_mut() {
            root.collect_panels_mut(&mut collect);
        }
        for panel in &collect {
            panels.push(panel.id);
        }

        if panels.is_empty() {
            self.focused_panel = None;
            return;
        }

        // Determine next panel after the currently focused one
        let current_idx = self
            .focused_panel
            .and_then(|f| panels.iter().position(|p| *p == f))
            .unwrap_or(usize::MAX);

        let next_idx = if current_idx == usize::MAX || current_idx == panels.len() - 1 {
            0
        } else {
            current_idx + 1
        };

        let next = panels[next_idx];
        self.focused_panel = Some(next);

        // Update focus flags
        for panel in &mut collect {
            panel.focused = panel.id == next;
        }
    }

    /// Focus the previous panel (circular).
    pub fn focus_previous_panel(&mut self) {
        let mut panels: Vec<PanelId> = Vec::new();
        let mut collect: Vec<&mut Panel> = Vec::new();
        if let Some(root) = self.root.as_mut() {
            root.collect_panels_mut(&mut collect);
        }
        for panel in &collect {
            panels.push(panel.id);
        }

        if panels.is_empty() {
            self.focused_panel = None;
            return;
        }

        let current_idx = self
            .focused_panel
            .and_then(|f| panels.iter().position(|p| *p == f))
            .unwrap_or(0);

        let prev_idx = if current_idx == 0 {
            panels.len() - 1
        } else {
            current_idx - 1
        };

        let prev = panels[prev_idx];
        self.focused_panel = Some(prev);

        for panel in &mut collect {
            panel.focused = panel.id == prev;
        }
    }

    /// Get a reference to the focused panel.
    pub fn focused_panel(&self) -> Option<&Panel> {
        let id = self.focused_panel?;
        let mut result = None;
        let mut collect: Vec<&Panel> = Vec::new();
        if let Some(root) = self.root.as_ref() {
            root.collect_panels(&mut collect);
        }
        for panel in collect {
            if panel.id == id {
                result = Some(panel);
                break;
            }
        }
        result
    }

    /// Get a mutable reference to the focused panel.
    pub fn focused_panel_mut(&mut self) -> Option<&mut Panel> {
        let id = self.focused_panel?;
        self.panel_mut(&id)
    }

    /// Get a mutable reference to a panel by id.
    pub fn panel_mut(&mut self, id: &PanelId) -> Option<&mut Panel> {
        let mut result = None;
        let mut collect: Vec<&mut Panel> = Vec::new();
        if let Some(root) = self.root.as_mut() {
            root.collect_panels_mut(&mut collect);
        }
        for panel in collect {
            if panel.id == *id {
                result = Some(panel);
                break;
            }
        }
        result
    }

    /// Get all panels (references).
    pub fn all_panels(&self) -> Vec<&Panel> {
        let mut result = Vec::new();
        if let Some(root) = self.root.as_ref() {
            root.collect_panels(&mut result);
        }
        result
    }

    /// Get all panels (mutable references).
    pub fn all_panels_mut(&mut self) -> Vec<&mut Panel> {
        let mut result = Vec::new();
        if let Some(root) = self.root.as_mut() {
            root.collect_panels_mut(&mut result);
        }
        result
    }

    /// Open a new tab in the focused panel (or first panel if none focused).
    pub fn open_tab(&mut self, tab: Tab) {
        // Make sure a panel exists
        self.init_default_layout();

        let id = self.focused_panel;
        if let Some(id) = id {
            if let Some(panel) = self.panel_mut(&id) {
                panel.add_tab(tab);
                return;
            }
        }

        // Fallback: open in first panel
        let mut collect: Vec<&mut Panel> = Vec::new();
        if let Some(root) = self.root.as_mut() {
            root.collect_panels_mut(&mut collect);
        }
        if let Some(first) = collect.first_mut() {
            first.add_tab(tab);
        }
    }

    /// Open a tab in a specific panel.
    pub fn open_tab_in_panel(&mut self, panel_id: &PanelId, tab: Tab) {
        if let Some(panel) = self.panel_mut(panel_id) {
            panel.add_tab(tab);
        }
    }

    /// Close a tab in the focused panel.
    pub fn close_tab(&mut self, tab_id: u64) {
        if let Some(panel) = self.focused_panel_mut() {
            panel.close_tab(tab_id);
        }
    }

    /// Allocate a new tab id.
    pub fn next_tab_id(&mut self) -> u64 {
        let id = self.next_tab_id;
        self.next_tab_id += 1;
        id
    }

    // -- Hit testing ------------------------------------------------------------

    /// Determine which panel (if any) is under a given position.
    pub fn panel_at(&self, x: u16, y: u16) -> Option<&Panel> {
        // Only within content area (not status bar)
        if y >= self.terminal_height.saturating_sub(self.status_bar_height) {
            return None;
        }
        let mut collect: Vec<&Panel> = Vec::new();
        if let Some(root) = self.root.as_ref() {
            root.collect_panels(&mut collect);
        }
        collect.into_iter().find(|p| p.rect.contains(x, y))
    }

    /// Determine whether a position is on a tab bar of a panel.
    pub fn tab_at(&self, x: u16, y: u16) -> Option<(PanelId, u64)> {
        let panel = self.panel_at(x, y)?;
        if y < panel.rect.y + self.tab_bar_height {
            // Check which tab
            let tab_bar_x = panel.rect.x;
            let mut x_offset = 0u16;
            for tab in &panel.tabs {
                let width = tab.display_title().len() as u16 + 2; // padding
                if x >= tab_bar_x + x_offset && x < tab_bar_x + x_offset + width {
                    return Some((panel.id, tab.id));
                }
                x_offset += width;
            }
        }
        None
    }

    // -- Rendering ----------------------------------------------------------------

    /// Render the tab bar for a given panel.
    pub fn render_tab_bar(&self, panel: &Panel) -> String {
        if panel.tabs.is_empty() {
            return format!("{:─<width$}", "", width = panel.rect.width as usize);
        }

        let mut out = String::new();
        let available_width = panel.rect.width as usize;
        let mut used = 0;

        // Render all tabs (truncate if too many)
        for (i, tab) in panel.tabs.iter().enumerate() {
            if used >= available_width {
                break;
            }
            let title = tab.display_title();
            let is_active = i == panel.active_tab;
            let width = title.len() + 2; // 1 space padding each side

            if is_active {
                out.push_str("\x1b[1m");
            }
            out.push_str(&format!(" {} ", title));
            if is_active {
                out.push_str("\x1b[22m");
            }
            used += width;
        }

        // Fill remaining with bottom border
        if used < available_width {
            out.push_str(&format!("{:─<width$}", "", width = available_width - used));
        }

        out
    }

    /// Render a single character representing the split direction.
    pub fn render_split_char(&self, direction: SplitDirection) -> char {
        match direction {
            SplitDirection::Horizontal => '│',
            SplitDirection::Vertical => '─',
        }
    }
}

impl Default for PanelManager {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// Extension helper – allow cloning a Panel into a PanelNode leaf
// ---------------------------------------------------------------------------

impl Panel {
    /// Convert a Panel into a leaf PanelNode (used during split operations).
    fn clone_into_leaf(&self) -> PanelNode {
        PanelNode::Panel(Box::new(Panel {
            id: self.id,
            tabs: self.tabs.clone(),
            active_tab: self.active_tab,
            rect: self.rect,
            scroll_offset: self.scroll_offset,
            focused: self.focused,
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_manager(width: u16, height: u16) -> PanelManager {
        let mut m = PanelManager::new();
        m.set_terminal_size(width, height);
        m.init_default_layout();
        m
    }

    #[test]
    fn test_init_layout() {
        let mut m = test_manager(100, 40);
        m.init_default_layout();
        assert_eq!(m.all_panels().len(), 1);
        let panel = m.focused_panel().unwrap();
        assert_eq!(panel.rect, Rect::new(0, 0, 100, 39)); // minus status bar
    }

    #[test]
    fn test_split_horizontal() {
        let mut m = test_manager(100, 40);
        m.init_default_layout();
        m.split(SplitDirection::Horizontal);
        assert_eq!(m.all_panels().len(), 2);
        // Both panels should be about half width
        let panels = m.all_panels();
        assert!(panels[0].rect.width > 40 && panels[0].rect.width <= 60);
        assert!(panels[1].rect.width > 40 && panels[1].rect.width <= 60);
    }

    #[test]
    fn test_split_vertical() {
        let mut m = test_manager(100, 40);
        m.init_default_layout();
        m.split(SplitDirection::Vertical);
        assert_eq!(m.all_panels().len(), 2);
        let panels = m.all_panels();
        assert!(panels[0].rect.height < panels[1].rect.height || panels[0].rect.height > panels[1].rect.height);
    }

    #[test]
    fn test_tab_management() {
        let mut m = test_manager(100, 40);
        let tab_id = m.next_tab_id();
        m.open_tab(Tab::new(tab_id, "file1.txt"));
        let tab_id2 = m.next_tab_id();
        m.open_tab(Tab::new(tab_id2, "file2.txt"));

        let panel = m.focused_panel().unwrap();
        assert_eq!(panel.tabs.len(), 2);
        assert_eq!(panel.active_tab, 1); // second tab active

        let mut m = m;
        m.focused_panel_mut().unwrap().previous_tab();
        let panel = m.focused_panel().unwrap();
        assert_eq!(panel.active_tab, 0);
    }

    #[test]
    fn test_close_panel() {
        let mut m = test_manager(100, 40);
        m.init_default_layout();
        m.split(SplitDirection::Horizontal);
        assert_eq!(m.all_panels().len(), 2);
        m.close_panel();
        assert_eq!(m.all_panels().len(), 1);
    }

    #[test]
    fn test_rect_contains() {
        let rect = Rect::new(10, 5, 50, 20);
        assert!(rect.contains(10, 5));
        assert!(rect.contains(59, 24));
        assert!(!rect.contains(60, 24));
        assert!(!rect.contains(9, 5));
    }

    #[test]
    fn test_panel_at() {
        let m = test_manager(100, 40);
        m.init_default_layout();
        let panel = m.panel_at(50, 20);
        assert!(panel.is_some());
        // Status bar area should be excluded
        assert!(m.panel_at(50, 39).is_none());
    }
}
