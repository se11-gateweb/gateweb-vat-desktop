const apiPath = 'ws://127.0.0.1:17777';

// callback
export const openScanner = (dispatch) => {
  const url = `${apiPath}/GetDevicesList`;
  const ws = new WebSocket(url, 'webfxscan');
  ws.onopen = () => console.log('ws opened');
  ws.onmessage = async (message) => {
    const scannerName = message.data.split(' ')[1];
    dispatch({ type: 'GET_SCAN_DEVICE', payload: scannerName });
  };
  ws.onclose = () => {
    ws.close();
  };
};

export const scan = (deviceName, handleMoveFile, handleScannerError, handleCloseDisable) => {
  console.log('scan() deviceName', deviceName);
  const paramJson = {
    'device-name': deviceName,
    scanmode: 'scan',
    'paper-size': 'A4',
    source: 'ADF-Back',
    resolution: 300,
    mode: 'color',
    imagefmt: 'jpg',
    brightness: 15,
    contrast: 35,
    quality: 100,
    swcrop: true,
    swdeskew: false,
    'front-eject': false,
    'manual-eject': false,
    duplexmerge: false,
    'remove-blank-page': false,
    'multifeed-detect': false,
    denoise: false,
    'remove-blackedges': false,
    'recognize-type': 'none',
    'recognize-lang': 'default',
  };

  const url = `${apiPath}/SetParams?${new URLSearchParams(paramJson).toString()}`;
  const ws = new WebSocket(url, 'webfxscan');
  ws.onopen = () => console.log('ws opened');
  ws.onerror = () => handleScannerError('error:');
  ws.onmessage = (message) => {
    console.log('scan()', message);
    const { data } = message;
    if (data.startsWith('FilePath:')) {
      const splitData = data.split('FilePath:');
      const filePath = splitData[1].split('\x00')[0];
      handleMoveFile(1, filePath);
    } else if (data === 'finish') {
      // todo
      handleCloseDisable();
    } else {
      handleScannerError(message.data);
    }
    // todo
  };
  ws.onclose = () => {
    ws.close();
  };
};
