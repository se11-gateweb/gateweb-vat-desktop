import React from 'react';
import {AppBar, Box, IconButton, Tooltip, Typography,} from '@mui/material';
import {Logout} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useAppDispatch, useAppState} from '../../Context/context';
import * as gwActions from '../../Actions/gwActions';

const AppBarWrap = styled.div`
  box-sizing: border-box;
  display: flex;
  padding: 12px 16px;
  height: 60px;
  justify-content: space-between;
  align-items: center;
`;

function DesktopNavbar() {
  const navigate = useNavigate();
  const appState = useAppState();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    gwActions.logout(dispatch);
    navigate('/login');
  };
  const renderUserMenu = () => {
    if (appState.auth) {
      return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Typography variant="subtitle2" sx={{mr: '20px'}}>
            <span>歡迎，</span>
            <span>ＯＯＯ會計師事務所 </span>
            <span>{appState.auth.user.username}</span>
          </Typography>
          <Tooltip title="登出">
            <IconButton aria-label="登出" onClick={handleLogout}>
              <Logout sx={{color: '#fff'}}/>
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return (
      <Tooltip title="登出">
        <IconButton aria-label="登出" onClick={handleLogout}>
          <Logout sx={{color: '#fff'}}/>
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <AppBar position="static">
      <AppBarWrap>
        <Typography variant="h6" component="h1">Cloud Suite - VAT</Typography>
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {renderUserMenu()}
        </Box>
      </AppBarWrap>
    </AppBar>
  );
}

export default DesktopNavbar;
