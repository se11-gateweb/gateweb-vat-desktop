import {makeStyles} from "@mui/styles";

import {useTheme} from '@mui/material';

const sideMenuWidth = 240;
const mainStyles = makeStyles(() => ({
  appBar: {
    boxSizing: 'border-box',
    display: 'flex',
    padding: '12px 16px',
    width: '100%',
    height: '60px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBarShift: {
    // marginLeft: sideMenuWidth,
    width: `calc(100% - ${sideMenuWidth}px)`,
    transition: useTheme().transitions.create(['width', 'margin'], {
      easing: useTheme().transitions.easing.sharp,
      duration: useTheme().transitions.duration.enteringScreen,
    }),
  },
  // appBarSpacer: theme.mixins.toolbar,
  backdrop: {
    zIndex: useTheme().zIndex.drawer + 1,
    color: '#fff',
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    // width: sideMenuWidth,
    transition: useTheme().transitions.create('width', {
      easing: useTheme().transitions.easing.sharp,
      duration: useTheme().transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: useTheme().transitions.create('width', {
      easing: useTheme().transitions.easing.sharp,
      duration: useTheme().transitions.duration.leavingScreen,
    }),
    width: useTheme().spacing(7),
    [useTheme().breakpoints.up('sm')]: {
      width: useTheme().spacing(9),
    },
  },
  formControl: {
    margin: useTheme().spacing(1),
    minWidth: 300,
  },
  // menuButton: {
  //   marginRight: 36,
  // },
  menuButtonHidden: {
    display: 'none',
  },
  // paper: {
  //   padding: theme.spacing(2),
  //   display: 'flex',
  //   overflow: 'auto',
  //   flexDirection: 'column',
  // },
  // root: {
  //   display: 'flex',
  // },
  selectEmpty: {
    // marginTop: theme.spacing(2),
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  title: {
    flexGrow: 1,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...useTheme().mixins.toolbar,
  },
  link: {
    margin: useTheme().spacing(1, 1.5),
    color: 'white',
  },

}));

export default mainStyles;
