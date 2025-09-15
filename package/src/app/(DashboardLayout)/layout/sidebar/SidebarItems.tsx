import React from "react";
import Menuitems from "./MenuItems";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";
import { IconPoint, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upgrade } from "./Updrade";
import { useState } from "react";

const SidebarItems = () => {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<{[key: string]: boolean}>({});

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderMenuItems = (items: any, level = 0) => {
    return items.map((item: any) => {
      const Icon = item.icon ? item.icon : IconPoint;
      const isSelected = pathname === item?.href;
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openSubmenus[item.id] || false;

      if (item.subheader) {
        return (
          <Box key={item.subheader} sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              {item.subheader}
            </Typography>
          </Box>
        );
      }

      return (
        <Box key={item.id}>
          <ListItem disablePadding sx={{ px: level > 0 ? 4 : 2 }}>
            <ListItemButton
              component={hasChildren ? "div" : Link}
              href={hasChildren ? undefined : item.href}
              onClick={hasChildren ? () => toggleSubmenu(item.id) : undefined}
              selected={isSelected}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                color: 'white',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                <Icon stroke={1.5} size="1.3rem" />
              </ListItemIcon>
              <ListItemText primary={item.title} />
              {hasChildren && (
                isOpen ? <IconChevronUp size="1rem" /> : <IconChevronDown size="1rem" />
              )}
            </ListItemButton>
          </ListItem>
          
          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(item.children, level + 1)}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          MedMe Assistant
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {renderMenuItems(Menuitems)}
      </List>

      {/* Upgrade Section */}
      <Box sx={{ p: 2 }}>
        <Upgrade />
      </Box>
    </Box>
  );
};

export default SidebarItems;
