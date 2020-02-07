import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SignaturePad from 'signature_pad'
import trimCanvas from 'trim-canvas'

export interface ReactSignatureCanvasProps extends SignaturePad.SignaturePadOptions {
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>
  clearOnResize?: boolean
}

export default class ReactSignatureCanvas extends Component<ReactSignatureCanvasProps> {
  static propTypes = {
    // signature_pad's props
    velocityFilterWeight: PropTypes.number,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    minDistance: PropTypes.number,
    dotSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    penColor: PropTypes.string,
    throttle: PropTypes.number,
    onEnd: PropTypes.func,
    onBegin: PropTypes.func,
    // props specific to the React wrapper
    canvasProps: PropTypes.object,
    clearOnResize: PropTypes.bool
  }

  static defaultProps = {
    clearOnResize: true
  }

  // this is some hack-ish init and casting to avoid `| null` everywhere :/
  _sigPad: SignaturePad = {} as SignaturePad
  _canvas: HTMLCanvasElement = {} as HTMLCanvasElement

  private readonly setRef = (ref: HTMLCanvasElement | null): void => {
    if (ref) {
      this._canvas = ref
    }
  }

  _excludeOurProps = (): SignaturePad.SignaturePadOptions => {
    const { canvasProps, clearOnResize, ...sigPadProps } = this.props
    return sigPadProps
  }

  componentDidMount: Component['componentDidMount'] = () => {
    this._sigPad = new SignaturePad(this._canvas, this._excludeOurProps())
    this._resizeCanvas()
    this.on()
  }

  componentWillUnmount: Component['componentWillUnmount'] = () => {
    this.off()
  }

  // propagate prop updates to SignaturePad
  componentDidUpdate: Component['componentDidUpdate'] = () => {
    Object.assign(this._sigPad, this._excludeOurProps())
  }

  // return the canvas ref for operations like toDataURL
  getCanvas = (): HTMLCanvasElement => {
    return this._canvas
  }

  // return a trimmed copy of the canvas
  getTrimmedCanvas = (): HTMLCanvasElement => {
    // copy the canvas
    const copy = document.createElement('canvas')
    copy.width = this._canvas.width
    copy.height = this._canvas.height
    copy.getContext('2d')!.drawImage(this._canvas, 0, 0)
    // then trim it
    return trimCanvas(copy)
  }

  // return the internal SignaturePad reference
  getSignaturePad = (): SignaturePad => {
    return this._sigPad
  }

  _checkClearOnResize = (): void => {
    if (!this.props.clearOnResize) {
      return
    }
    this._resizeCanvas()
  }

  _resizeCanvas = (): void => {
    const canvasProps = this.props.canvasProps || {}
    const { width, height } = canvasProps
    // don't resize if the canvas has fixed width and height
    if (width && height) {
      return
    }

    const canvas = this._canvas
    /* When zoomed out to less than 100%, for some very strange reason,
      some browsers report devicePixelRatio as less than 1
      and only part of the canvas is cleared then. */
    const ratio = Math.max(window.devicePixelRatio || 1, 1)

    if (!width) {
      canvas.width = canvas.offsetWidth * ratio
    }
    if (!height) {
      canvas.height = canvas.offsetHeight * ratio
    }
    canvas.getContext('2d')!.scale(ratio, ratio)
    this.clear()
  }

  render: Component['render'] = () => {
    const { canvasProps } = this.props
    return <canvas ref={this.setRef} {...canvasProps} />
  }

  // all wrapper functions below render
  //
  on: SignaturePad['on'] = () => {
    window.addEventListener('resize', this._checkClearOnResize)
    return this._sigPad.on()
  }

  off: SignaturePad['off'] = () => {
    window.removeEventListener('resize', this._checkClearOnResize)
    return this._sigPad.off()
  }

  clear: SignaturePad['clear'] = () => {
    return this._sigPad.clear()
  }

  isEmpty: SignaturePad['isEmpty'] = () => {
    return this._sigPad.isEmpty()
  }

  fromDataURL: SignaturePad['fromDataURL'] = (dataURL, options) => {
    return this._sigPad.fromDataURL(dataURL, options)
  }

  toDataURL: SignaturePad['toDataURL'] = (type, encoderOptions) => {
    return this._sigPad.toDataURL(type, encoderOptions)
  }

  fromData: SignaturePad['fromData'] = (pointGroups) => {
    return this._sigPad.fromData(pointGroups)
  }

  toData: SignaturePad['toData'] = () => {
    return this._sigPad.toData()
  }
}
