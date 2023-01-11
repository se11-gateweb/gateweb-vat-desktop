import React, { useEffect, useState } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, MenuItem, Stack, TextField
} from '@mui/material'
import PropTypes from 'prop-types'
import { GW_EVIDENCE_TYPE } from '../../../Mapper/gw_mapper'

const R = require('ramda')

function DialogComponent(props) {
  const [renderEvidenceTypeList, setRenderEvidenceTypeList] = useState([])

  const handleChange = (event) => {
    props.handleSelectionChange(event)
  }

  useEffect(() => {
    const keyList = R.keys(GW_EVIDENCE_TYPE)
    const { isDeclareBusinessTax } = props.declareProperties
    if (isDeclareBusinessTax === 'true') {
      const data = keyList
        .filter((key) => GW_EVIDENCE_TYPE[key].id !== '').map((key) => {
          const id = `${GW_EVIDENCE_TYPE[key].id} `
          const { name } = GW_EVIDENCE_TYPE[key]
          return (
            <MenuItem
              key={key}
              value={key}
            >
              {(id + name)}
            </MenuItem>
          )
        })
      setRenderEvidenceTypeList([...data])
    } else {
      const data = keyList
        .map((key) => {
          const id = GW_EVIDENCE_TYPE[key].id === '' ? '99 ' : `${GW_EVIDENCE_TYPE[key].id} `
          const { name } = GW_EVIDENCE_TYPE[key]
          return (
            <MenuItem
              key={key}
              value={key}
            >
              {(id + name)}
            </MenuItem>
          )
        })
      setRenderEvidenceTypeList([...data])
    }
  }, [props.declareProperties.isDeclareBusinessTax])



  const renderIsDeclareBusinessTax = () => (
    <FormControl fullWidth>
      <TextField
        id='is-declare-business-select'
        name='isDeclareBusinessTax'
        select
        value={props.declareProperties.isDeclareBusinessTax}
        onChange={handleChange}
        label='是否申報營業稅'
        defaultValue={`${true}`}
      >
        <MenuItem key={1} value={`${true}`}>是</MenuItem>
        <MenuItem key={2} value={`${false}`}>否</MenuItem>
      </TextField>
    </FormControl>
  )

  const renderEvidenceType = (evidenceTypeList) => (
    <FormControl fullWidth>
      <TextField
        id='evidence-type-select'
        name='evidenceType'
        select
        value={props.declareProperties.evidenceType}
        onChange={handleChange}
        label='請選擇憑證種類'
        defaultValue=''
      >
        <MenuItem key={0} value=''>請選擇憑證種類</MenuItem>
        {evidenceTypeList}
      </TextField>
    </FormControl>
  )

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      fullWidth={true}
      aria-labelledby='設定是否申報營業稅與選擇憑證種類'
    >
      <DialogTitle id='responsive-dialog-title'>設定</DialogTitle>

      <DialogContent>
        <Stack spacing={2} my={2}>
          {renderIsDeclareBusinessTax()}
          {renderEvidenceType(renderEvidenceTypeList)}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant='outlined'
          onClick={(e) => {
            props.handleClose()
            props.handleReset()
          }}
          color='primary'
        >
          取消
        </Button>
        <Button
          variant='contained'
          disableElevation={true}
          onClick={(e) => {
              props.handleClose()
              props.onConfirm()
          }}
          color='primary'
        >
          確認
        </Button>
      </DialogActions>
    </Dialog>
  )
}

DialogComponent.propTypes = {
  declareProperties: PropTypes.any,
  open: PropTypes.any,
  handleSelectionChange: PropTypes.func,
  handleClose: PropTypes.func,
  handleReset: PropTypes.func,
  onConfirm: PropTypes.func
}

export default DialogComponent
