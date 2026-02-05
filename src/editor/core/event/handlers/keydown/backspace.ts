import { ZERO } from '../../../../dataset/constant/Common'
import { CanvasEvent } from '../../CanvasEvent'

function backspaceHideElement(host: CanvasEvent) {
  const draw = host.getDraw()
  const rangeManager = draw.getRange()
  const range = rangeManager.getRange()
  const elementList = draw.getElementList()
  const element = elementList[range.startIndex]
  if (!element.hide && !element.control?.hide && !element.area?.hide) return
  let index = range.startIndex
  while (index > 0) {
    const element = elementList[index]
    let newIndex: number | null = null
    if (element.controlId) {
      newIndex = draw.getControl().removeControl(index)
      if (newIndex !== null) {
        index = newIndex
      }
    } else {
      draw.spliceElementList(elementList, index, 1)
      newIndex = index - 1
      index--
    }
    const newElement = elementList[newIndex!]
    if (
      !newElement ||
      (!newElement.hide && !newElement.control?.hide && !newElement.area?.hide)
    ) {
      if (newIndex) {
        range.startIndex = newIndex
        range.endIndex = newIndex
        rangeManager.replaceRange(range)
        const position = draw.getPosition()
        const positionList = position.getPositionList()
        position.setCursorPosition(positionList[newIndex])
      }
      break
    }
  }
}

export function backspace(evt: KeyboardEvent, host: CanvasEvent) {
  const draw = host.getDraw()
  if (draw.isReadonly()) return
  const rangeManager = draw.getRange()
  if (!rangeManager.getIsCanInput()) return
  if (rangeManager.getIsCollapsed()) {
    backspaceHideElement(host)
  }
  const control = draw.getControl()
  const { startIndex, endIndex, isCrossRowCol } = rangeManager.getRange()
  let curIndex: number | null
  if (isCrossRowCol) {
    const rowCol = draw.getTableParticle().getRangeRowCol()
    if (!rowCol) return
    let isDeleted = false
    for (let r = 0; r < rowCol.length; r++) {
      const row = rowCol[r]
      for (let c = 0; c < row.length; c++) {
        const col = row[c]
        if (col.value.length > 1) {
          draw.spliceElementList(col.value, 1, col.value.length - 1)
          isDeleted = true
        }
      }
    }
    curIndex = isDeleted ? 0 : null
  } else if (
    control.getActiveControl() &&
    control.getIsRangeCanCaptureEvent()
  ) {
    curIndex = control.keydown(evt)
    if (curIndex) {
      control.emitControlContentChange()
    }
  } else {
    const cursorPosition = draw.getPosition().getCursorPosition()
    if (!cursorPosition) return
    const { index } = cursorPosition
    const isCollapsed = rangeManager.getIsCollapsed()
    const elementList = draw.getElementList()
    if (isCollapsed && index === 0) {
      const firstElement = elementList[index]
      if (firstElement.value === ZERO) {
        if (firstElement.listId) {
          draw.getListParticle().unsetList()
        }
        evt.preventDefault()
        return
      }
    }
    const startElement = elementList[startIndex]
    if (isCollapsed && startElement.rowFlex && startElement.value === ZERO) {
      const rowFlexElementList = rangeManager.getRangeRowElementList()
      if (rowFlexElementList) {
        const preElement = elementList[startIndex - 1]
        rowFlexElementList.forEach(element => {
          element.rowFlex = preElement?.rowFlex
        })
      }
    }
    if (!isCollapsed) {
      draw.spliceElementList(elementList, startIndex + 1, endIndex - startIndex)
    } else {
      draw.spliceElementList(elementList, index, 1)
    }
    curIndex = isCollapsed ? index - 1 : startIndex
  }
  draw.getGlobalEvent().setCanvasEventAbility()
  if (curIndex === null) {
    rangeManager.setRange(startIndex, startIndex)
    draw.render({
      curIndex: startIndex,
      isSubmitHistory: false
    })
  } else {
    rangeManager.setRange(curIndex, curIndex)
    draw.render({
      curIndex
    })
  }
}
