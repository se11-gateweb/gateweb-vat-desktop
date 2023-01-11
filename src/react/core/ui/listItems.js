import React from 'react';
import {
  ListItem, ListItemIcon, ListItemText, ListSubheader,
} from '@mui/material';
import { Assignment, Dashboard } from '@mui/icons-material';

// todo
export const mainListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <Dashboard />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Saved reports</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <Assignment />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Assignment />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Assignment />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItem>
  </div>
);
