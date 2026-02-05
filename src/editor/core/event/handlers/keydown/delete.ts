import { CanvasEvent } from '../../CanvasEvent'

function deleteHideElement(host: CanvasEvent) {
  const draw = host.getDraw()
  const rangeManager = draw.getRange()
  const range = rangeManager.getRange()
  const elementList = draw.getElementList()
  const nextElement = elementList[range.startIndex + 1]
  if (
    !nextElement.hide &&
    !nextElement.control?.hide &&
    !nextElement.area?.hide
  ) {
    return
  }
  const index = range.startIndex + 1
  while (index < elementList.length) {
    const element = elementList[index]
    let newIndex: number | null = null
    if (element.controlId) {
      newIndex = draw.getControl().removeControl(index)
    } else {
      draw.spliceElementList(elementList, index, 1)
      newIndex = index
    }
    const newElement = elementList[newIndex!]
    if (
      !newElement ||
      (!newElement.hide && !newElement.control?.hide && !newElement.area?.hide)
    ) {
      break
    }
  }
}

export function del(evt: KeyboardEvent, host: CanvasEvent) {
  const draw = host.getDraw()
  if (draw.isReadonly()) return
  const rangeManager = draw.getRange()
  if (!rangeManager.getIsCanInput()) return
  const { startIndex, endIndex, isCrossRowCol } = rangeManager.getRange()
  const elementList = draw.getElementList()
  const control = draw.getControl()
  if (rangeManager.getIsCollapsed()) {
    deleteHideElement(host)
  }
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
  } else if (control.getActiveControl() && control.getIsRangeWithinControl()) {
    curIndex = control.keydown(evt)
    if (curIndex) {
      control.emitControlContentChange()
    }
  } else if (elementList[endIndex + 1]?.controlId) {
    curIndex = control.removeControl(endIndex + 1)
  } else {
    const position = draw.getPosition()
    const cursorPosition = position.getCursorPosition()
    if (!cursorPosition) return
    const { index } = cursorPosition
    const positionContext = position.getPositionContext()
    if (positionContext.isDirectHit && positionContext.isImage) {
      draw.spliceElementList(elementList, index, 1)
      curIndex = index - 1
    } else {
      const isCollapsed = rangeManager.getIsCollapsed()
      if (!isCollapsed) {
        draw.spliceElementList(
          elementList,
          startIndex + 1,
          endIndex - startIndex
        )
      } else {
        if (!elementList[index + 1]) return
        draw.spliceElementList(elementList, index + 1, 1)
      }
      curIndex = isCollapsed ? index : startIndex
    }
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
