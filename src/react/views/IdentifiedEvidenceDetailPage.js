import React, {useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DesktopNavbar from "../core/layout/DesktopNavbar";
import {useAppDispatch, useAppState} from "../Context/context";
import {ArrowBack, Delete, Edit, Help} from "@mui/icons-material";
import {GW_EVIDENCE_TYPE, TAX_TYPE} from "../Mapper/gw_mapper";
import * as electronActions from "../Actions/electionActions";
import {getJsonRawData} from "../Actions/electionActions";
import {getTxtPeriod} from "../Util/Time";

const R = require('ramda');

const evidenceDetailHead = [
  {
    name: 'sn', title: '序號', haveTips: false, tipsContent: '',
  }, {
    name: 'reportingPeriod', title: '申報期別', haveTips: false, tipsContent: '',
  }, {
    name: 'declare', title: '申報', haveTips: false, tipsContent: '選擇是會併入營業稅申報資料中，選擇否則不併入',
  }, {
    name: 'evidenceType', title: '憑證類型', haveTips: false, tipsContent: '',
  }, {
    name: 'taxType',
    title: '課稅說明',
    haveTips: true,
    tipsContent: '除課稅別為應稅、免稅、零稅外，若為多個稅別則註記為混合稅',
  }, {
    name: 'other', title: '其他代收付', haveTips: false, tipsContent: '',
  }, {
    name: 'evidenceDate',
    title: '憑證日期',
    haveTips: true,
    tipsContent: '為憑證開立日期、海關繳納憑證及公營事業載具之帳單繳款日',
  }, {
    name: 'evidenceId',
    title: '憑證號碼',
    haveTips: true,
    tipsContent: '發票號碼/公用事業載具流水號/海關繳納憑證號碼/其他憑證號碼等',
  }, {
    name: 'buyerTaxId', title: '買受人統編', haveTips: false, tipsContent: '',
  }, {
    name: 'sellerTaxId', title: '銷售人統編', haveTips: true, tipsContent: '海關繳納憑證免填"',
  }, {
    name: '', title: '銷售額', haveTips: true, tipsContent: '由上往下為應稅銷售額、免稅銷售額及零稅銷售額',
  }, {
    name: 'taxAmount', title: '稅額', haveTips: false, tipsContent: '',
  }, {
    name: 'totalAmount', title: '憑證總額', haveTips: false, tipsContent: '',
  }, {
    name: 'totalPayAmount', title: '付款總金額', haveTips: false, tipsContent: '',
  }];

function renderEvidenceType() {
  const keyList = R.keys(GW_EVIDENCE_TYPE);
  return keyList
    .map(key => {
      const {id, name} = GW_EVIDENCE_TYPE[key]
      return <MenuItem key={key} value={key}>
        {id} {name}
      </MenuItem>
    })
}

function renderTaxType() {
  const keyList = R.keys(TAX_TYPE)
  return keyList
    .map(key => {
      const {name, number} = TAX_TYPE[key]
      return <MenuItem key={key} value={number + ""}>
        {name}
      </MenuItem>
    })
}

function renderOther() {
  return ['Y', 'N']
    .map(key => {
      return <MenuItem key={key} value={key}>
        {key}
      </MenuItem>
    })
}


const EvidenceDetail = (props) => {
  const {data, handleChange, canEdit} = props
  return (
    <TableRow key='1'>
      <TableCell align={'center'} size={'small'}>
        1
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="reportingPeriod"
          variant="standard"
          value={data.reportingPeriod}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          select
          fullWidth
          value={data.isDeclareBusinessTax}
          disabled={!canEdit}
          name='isDeclareBusinessTax'
          onChange={(e) => handleChange(e)}
        >
          <MenuItem key='isDeclareBusinessTax_true' value={'true'}>
            是
          </MenuItem>
          <MenuItem key='isDeclareBusinessTax_false' value={'false'}>
            否
          </MenuItem>
        </TextField>
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          name='evidenceType'
          select
          fullWidth
          value={data.evidenceType}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        >
          {renderEvidenceType()}
        </TextField>
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          select
          fullWidth
          name='taxType'
          value={data.taxType}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        >
          {renderTaxType()}
        </TextField>
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          select
          fullWidth
          name='other'
          value={data.other}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        >
          {renderOther()}
        </TextField>
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="evidenceDate"
          variant="standard"
          value={data.evidenceDate}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="evidenceNumber"
          variant="standard"
          value={data.evidenceNumber}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="buyerTaxId"
          variant="standard"
          value={data.buyerTaxId}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="sellerTaxId"
          variant="standard"
          value={data.sellerTaxId}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="taxableSalesValue"
          variant="standard"
          value={data.taxableSalesValue}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="businessTaxValue"
          variant="standard"
          value={data.businessTaxValue}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="totalAmount"
          variant="standard"
          value={data.totalAmount}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
      <TableCell align={'center'} size={'small'}>
        <TextField
          fullWidth
          name="totalPayAmount"
          variant="standard"
          value={data.totalPayAmount}
          disabled={!canEdit}
          onChange={(e) => handleChange(e)}
        />
      </TableCell>
    </TableRow>
  )
}


function IdentifiedEvidenceDetailPage(props) {

  const dispatch = useAppDispatch()
  const navigate = useNavigate();
  const location = useLocation();
  const appState = useAppState()
  const {declareProperties} = location.state

  const [data, setData] = useState(location.state.data)
  const [canEdit, setCanEdit] = useState(false)

  const handleDelete = (e) => {
    electronActions.deleteData(dispatch, declareProperties.clientTaxId, '03', data['id'])
    goBack()
  }

  const goBack = () => {
    navigate("/", {
      state: declareProperties
    })
  }


  const handleChange = async (e) => {
    const {name, value} = e.target
    // dispatch
    const jsonData = await getJsonRawData(data['id'], declareProperties.clientTaxId)
    let copyOfObject = {...data}
    if (name === 'reportingPeriod') {
      jsonData['reportingPeriod'].result = value
      copyOfObject['reportingPeriod'] = value
    }
    if (name === 'isDeclareBusinessTax') {
      jsonData['isDeclareBusinessTax'].result = value
      copyOfObject['isDeclareBusinessTax'] = value
      //todo
      // jsonData['isDeclareBusinessTax-view'].result = value === 'true' ? '是' : '否'
    }
    if (name === 'evidenceType') {
      jsonData[name].result = value
      copyOfObject[name] = value
    }
    if (name === 'taxType') {
      jsonData[name].result = value
      copyOfObject[name] = value
    }
    if (name === 'evidenceDate') {
      jsonData[name].result = value
      copyOfObject[name] = value
      jsonData['period'].result = getTxtPeriod(jsonData[name].result) + ''
    }
    if (name === 'evidenceNumber') {
      jsonData[name].result = value
      copyOfObject[name] = value
    }
    if (name === 'buyerTaxId') {
      jsonData[name].result = value
      copyOfObject[name] = value
    }
    if (name === 'sellerTaxId') {
      jsonData[name].result = value
      copyOfObject[name] = value
    }
    if (name === 'taxableSalesValue') {
      jsonData['taxableSalesValue'].result = value
      copyOfObject['taxableSalesValue'] = value
    }
    //其他代收付
    if (name === 'other') {
      jsonData['other'].result = value
      copyOfObject['other'] = value
    }
    if (name === 'dutyFreeSalesValue') {
      jsonData['dutyFreeSalesValue'].result = value
      copyOfObject['dutyFreeSalesValue'] = value
    }
    if (name === 'zeroTaxSalesValue') {
      jsonData['zeroTaxSalesValue'].result = value
      copyOfObject['zeroTaxSalesValue'] = value
    }
    if (name === 'businessTaxValue') {
      jsonData['businessTaxValue'].result = value
      copyOfObject['businessTaxValue'] = value
    }
    if (name === 'totalAmount') {
      jsonData['totalAmount'].result = value
      copyOfObject['totalAmount'] = value
    }
    if (name === 'totalPayAmount') {
      jsonData['totalPayAmount'].result = value
      copyOfObject['totalPayAmount'] = value
    }
    if (name === 'otherFee') {
      jsonData['otherFee'].result = value
      copyOfObject['otherFee'] = value
      jsonData['other'].result = parseInt(jsonData['otherFee'].result) > 0 ? 'Y' : 'N'
      copyOfObject['other'] = parseInt(jsonData['otherFee'].result) > 0 ? 'Y' : 'N'
    }
    if (name === 'zeroTaxDeductionType') {
      jsonData['zeroTaxDeductionType'].result = value
      copyOfObject['zeroTaxDeductionType'] = value
    }
    if (name === 'taxableDeductionType') {
      jsonData['taxableDeductionType'].result = value
      copyOfObject['taxableDeductionType'] = value
    }
    if (name === "dutyFreeDeductionType") {
      jsonData['dutyFreeDeductionType'].result = value
      copyOfObject['dutyFreeDeductionType'] = value
    }
    //todo update
    const result = await electronActions.updateData(declareProperties.clientTaxId, jsonData)
    console.log("jsonData", jsonData)

    setData(prev => ({...copyOfObject}))
  }

  const renderClientSelect = () => (<Stack spacing={2} direction="row" my={3}>
    <FormControl sx={{width: '25%'}}>
      <TextField
        id="client-taxId-select"
        name="clientTaxId"
        select
        value={declareProperties.clientTaxId}
        disabled={true}
        defaultValue={declareProperties.clientTaxId}
        label="請選擇營利事業單位"
      >
        <MenuItem key={0} value="">
          請選擇營利事業單位
        </MenuItem>
        {appState.appData.clientLists.map((client) => (<MenuItem key={client.taxId.id} value={client.taxId.id}>
          {client.taxId.id} {client.businessName}
        </MenuItem>))}
      </TextField>
    </FormControl>
  </Stack>)


  return (<>
      <CssBaseline/>
      <DesktopNavbar/>
      <Container maxWidth="false">
        <Box>{renderClientSelect()}</Box>
        <Stack direction='row' spacing={2} mb={2}>
          <Button
            variant='contained'
            startIcon={<Delete/>}
            component='label'
            onClick={e => handleDelete(e)}
          >
            刪除
          </Button>
          <Button
            variant='contained'
            startIcon={<Edit/>}
            component='label'
            onClick={(e) => {
              setCanEdit(!canEdit)
            }}
          >
            編輯
          </Button>
          <Button
            variant='contained'
            startIcon={<ArrowBack/>}
            onClick={(e) => goBack()}
            component='label'
          >
            返回取得辨識結果
          </Button>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{whiteSpace: 'nowrap'}}>
                {evidenceDetailHead.map((row) => (<TableCell key={row.name}>
                  <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Typography component="span">{row.title}</Typography>
                    {row.haveTips ? (<Tooltip title={row.tipsContent}>
                      <IconButton>
                        <Help fontSize="small"/>
                      </IconButton>
                    </Tooltip>) : ''}
                  </Box>
                </TableCell>))}
              </TableRow>
            </TableHead>
            <TableBody>
              <EvidenceDetail data={data} handleChange={handleChange} canEdit={canEdit}/>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography sx={{color: '#2890CF', fontWeight: 'bold'}} my={2} variant="h6">課稅說明</Typography>
        <Paper variant="outlined">
          <Table sx={{'th, td': {border: 0}}}>
            <TableHead>
              <TableRow sx={{whiteSpace: 'nowrap'}}>
                <TableCell align="center">課稅別</TableCell>
                <TableCell align="center">扣抵代碼</TableCell>
                <TableCell align="center">銷售額</TableCell>
                <TableCell align="center">稅額</TableCell>
                <TableCell align="center">總金額</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell sx={{fontWeight: 'bold'}}>應稅</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    select
                    variant="standard"
                    disabled={!canEdit}
                    name={'taxableDeductionType'}
                    value={data.taxableDeductionType}
                    onChange={(e) => handleChange(e)}
                  >
                    <MenuItem value="">空白</MenuItem>
                    <MenuItem value="1">1 進項可扣抵之進貨及費用</MenuItem>
                    <MenuItem value="2">2 進項可扣抵之固定資產</MenuItem>
                    <MenuItem value="3">3 進項不可扣抵之進貨及費用</MenuItem>
                    <MenuItem value="4">4 進項不可扣抵之固定資產</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    inputProps={{type: 'number'}}
                    variant="standard"
                    disabled={!canEdit}
                    value={data.taxableSalesValue}
                    name={'taxableSalesValue'}
                    onChange={(e) => handleChange(e)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    inputProps={{type: 'number'}}
                    variant="standard"
                    name='businessTaxValue'
                    disabled={!canEdit}
                    value={data.businessTaxValue}
                    onChange={(e) => handleChange(e)}
                  />
                </TableCell>
                <TableCell/>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{fontWeight: 'bold'}}>免稅</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    select
                    variant="standard"
                    disabled={!canEdit}
                    value={data.dutyFreeDeductionType}
                    name='dutyFreeDeductionType'
                    onChange={(e) => handleChange(e)}
                  >
                    <MenuItem value="">空白</MenuItem>
                    <MenuItem value="3">3 進項不可扣抵之進貨及費用</MenuItem>
                    <MenuItem value="4">4 進項不可扣抵之固定資產</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    inputProps={{type: 'number'}}
                    variant="standard"
                    disabled={!canEdit}
                    name='dutyFreeSalesValue'
                    value={data.dutyFreeSalesValue}
                    onChange={(e) => handleChange(e)}
                  />
                </TableCell>
                <TableCell/>
                <TableCell/>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{fontWeight: 'bold'}}>零稅</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    select
                    variant="standard"
                    disabled={!canEdit}
                    name='zeroTaxDeductionType'
                    value={data.zeroTaxDeductionType}
                    onChange={(e) => handleChange(e)}
                  >
                    <MenuItem value="">空白</MenuItem>
                    <MenuItem value="3">3 進項不可扣抵之進貨及費用</MenuItem>
                    <MenuItem value="4">4 進項不可扣抵之固定資產</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    inputProps={{type: 'number'}}
                    variant="standard"
                    disabled={!canEdit}
                    name='zeroTaxSalesValue'
                    value={data.zeroTaxSalesValue}
                    onChange={(e) => handleChange(e)}
                  />
                </TableCell>
                <TableCell/>
                <TableCell>
                  <TextField
                    fullWidth
                    inputProps={{type: 'number'}}
                    variant="standard"
                    disabled={!canEdit}
                    name='totalAmount'
                    value={data.totalAmount}
                    onChange={(e) => handleChange(e)}
                  />
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell colSpan={4} sx={{fontWeight: 'bold'}}>帳單內代收付之其他金額</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    inputProps={{type: 'number'}}
                    variant="standard"
                    disabled={!canEdit}
                    name='otherFee'
                    value={data.otherFee}
                    onChange={(e) => handleChange(e)}
                  />
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell colSpan={4} sx={{fontWeight: 'bold'}}>憑證付款總金額</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    inputProps={{type: 'number'}}
                    variant="standard"
                    disabled={!canEdit}
                    name='totalPayAmount'
                    value={data.totalPayAmount}
                    onChange={(e) => handleChange(e)}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </>

  )


}


export default IdentifiedEvidenceDetailPage