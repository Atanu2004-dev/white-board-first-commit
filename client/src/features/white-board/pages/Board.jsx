import { useRef, useEffect, useState } from 'react'
import { useParams,useNavigate } from 'react-router'
import { io } from 'socket.io-client' 
import { getBoard, saveStrokes,deleteBoard } from '../services/board.api'
import InviteModal from '../components/InviteModal'
import '../Board.css'


const SOCKET_URL = 'http://localhost:3000'
const Board = () => {
  const { boardId } = useParams()
  const navigate = useNavigate()


  const canvasRef = useRef(null) //holds the referrence of canves refference 
  const ctxRef = useRef(null)
  const lastPointRef = useRef({ x: 0, y: 0 })//dot dot
  const currentStrokeRef = useRef(null)

  const saveTimeoutRef = useRef(null) // holds the debounce timer id
  const hasLoadedRef = useRef(false) // prevents saving before the initial load finishes
  const socketRef = useRef(null) 
  const strokesRef = useRef([])
  const historyRef = useRef([])


  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#1C1E21')
  const [lineWidth, setLineWidth] = useState(3)
  const [strokes, setStrokes] = useState([])
  const [canUndo, setCanUndo] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
  const canvas = canvasRef.current   //Pehle wale canvasRef se actual <canvas> DOM element nikal liya
  const dpr = window.devicePixelRatio || 1 //DPR (Device Pixel Ratio)

  const cssWidth = 800
  const cssHeight = 400

  canvas.width = cssWidth * dpr
  canvas.height = cssHeight * dpr
  canvas.style.width = `${cssWidth}px`//Ye style.width/height CSS ke through visually kitna bada dikhega wo control karta hai
  canvas.style.height = `${cssHeight}px`

  const ctx = canvas.getContext('2d')//Drawing tool (context) nikalna
  ctx.scale(dpr, dpr)  //ab se jab bhi main koi coordinate doon (jaise x=100), tum usse automatically dpr times multiply kar dena internally.
  ctx.lineCap = 'round'//Line ke dono ends (shuru aur khatam) gol dikhenge
  ctx.lineJoin = 'round'//Jab do lines milte hain (corner pe), unka joint bhi gol/smooth dikhega, sharp angle nahi.
  ctxRef.current = ctx
  }, []) //[]  -> means ye sirf ek baar chalo, jab component pehli baar mount ho (screen pe aaye)

  useEffect(() => {
    if (!ctxRef.current) return
    ctxRef.current.strokeStyle = color //color state change hote hi ye useEffect trigger hota hai aur pencil ka color badal deta hai.
    ctxRef.current.lineWidth = lineWidth //same as color as width
  }, [color, lineWidth])


  // Connect socket, join this board's room, listen for remote strokes

  useEffect(() => {
    const socket = io(SOCKET_URL)
    socketRef.current = socket

    const joinBoard = () => socket.emit('join-board', boardId)
    socket.on('connect', joinBoard)

    socket.on('new-stroke', (stroke) => {
      applyBoardState([...strokesRef.current, stroke])
    })

    socket.on('clear-board', () => {
      if (strokesRef.current.length > 0) applyBoardState([])
    })

    socket.on('undo-board', ({ strokes: previousStrokes }) => {
      historyRef.current.pop()
      applyBoardState(previousStrokes, false)
    })

    return () => {
      socket.off('connect', joinBoard)
      socket.off('new-stroke')
      socket.off('clear-board')
      socket.off('undo-board')
      socket.disconnect()
    }
  }, [boardId])

  // Load saved strokes for this board once the canvas is ready
  useEffect(() => {
    async function loadBoard() {
      hasLoadedRef.current = false
      historyRef.current = []
      strokesRef.current = []
      setCanUndo(false)
      try {
        const board = await getBoard(boardId)
        const loadedStrokes = board.strokes || []
        strokesRef.current = loadedStrokes
        setStrokes(loadedStrokes)
        redrawCanvas(loadedStrokes)
      } catch (err) {
        console.log('Could not load board strokes:', err)
      } finally {
        hasLoadedRef.current = true // only start auto-saving after this
      }
    }

    loadBoard()
  }, [boardId])


  // Debounced auto-save: whenever strokes changes, wait a moment, then save
  useEffect(() => {
    if (!hasLoadedRef.current) return // don't save while the initial load is still happening

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveStrokes(boardId, strokes).catch((err) =>
        console.log('Could not save strokes:', err)
      )
    }, 800)

    return () => clearTimeout(saveTimeoutRef.current)
  }, [strokes, boardId])

  // Redraws the ENTIRE canvas from the strokes array.
  // This is the function that will later also run when strokes are
  // loaded from the backend or received from another user via Socket.io.
  const redrawCanvas = (strokesToDraw) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    strokesToDraw.forEach((stroke) => {
      if (stroke.points.length < 2) return

      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }

      ctx.stroke()
    })

    // restore the live drawing style after a full redraw
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
  }

  const applyBoardState = (nextStrokes, recordHistory = true) => {
    if (recordHistory) {
      historyRef.current.push(strokesRef.current)
      if (historyRef.current.length > 50) historyRef.current.shift()
    }

    strokesRef.current = nextStrokes
    setStrokes(nextStrokes)
    setCanUndo(historyRef.current.length > 0)
    redrawCanvas(nextStrokes)
  }

  const undo = () => {
    if (historyRef.current.length === 0) return

    const previousStrokes = historyRef.current.pop()
    applyBoardState(previousStrokes, false)
    socketRef.current.emit('undo-board', { boardId, strokes: previousStrokes })
  }

  const getCoords = (e) => ({
    x: e.nativeEvent.offsetX,
    y: e.nativeEvent.offsetY,
  })

  const startDrawing = (e) => {
    const { x, y } = getCoords(e)
    lastPointRef.current = { x, y } 

    currentStrokeRef.current = {          
      points: [{ x, y }],                 
      color,                              
      width: lineWidth,                   
    } 
    
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return   // 👈 agar false hai, to kuch mat karo

    const { x, y } = getCoords(e)
    const ctx = ctxRef.current

    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y) // 👈 PURANA point
    ctx.lineTo(x, y)                                              // 👈 NAYA point
    ctx.stroke()

    lastPointRef.current = { x, y }                           // 👈 ab ye "purana" ban gaya, agli baar ke liye
    currentStrokeRef.current.points.push({ x, y }) 
  }

  const stopDrawing = () => {
    setIsDrawing(false)

    const finishedStroke = currentStrokeRef.current   // 👈 ADD THIS
    if (finishedStroke && finishedStroke.points.length > 1) {   // 👈 ADD THIS
      applyBoardState([...strokesRef.current, finishedStroke])
      socketRef.current.emit('new-stroke', { boardId, stroke: finishedStroke })
    }                                                 
    currentStrokeRef.current = null 
  }

  const clearCanvas = () => {
    if (strokesRef.current.length === 0) return
    applyBoardState([])
    socketRef.current.emit('clear-board', boardId)
  }
  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this board? This cannot be undone.')
    if (!confirmed) return

    try {
      setIsDeleting(true)
      await deleteBoard(boardId)
      navigate('/')
    } catch (err) {
      console.log('Could not delete board:', err)
      setIsDeleting(false)
    }
  }


  const colors = ['#1C1E21', '#2D6CDF', '#E8483A', '#3FA66B', '#F59E0B','#C026D3', '#0891B2',]
  return (
    <main className="board-container">
      <div className="board-toolbar">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`color-swatch ${color === c ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
        
        <input
          type="range"
          min="1"
          max="12"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />

        <button className="button" onClick={undo} disabled={!canUndo} title="Undo last board change">
          Undo
        </button>

        <button className="button" onClick={clearCanvas}>
          Clear
        </button>

        <div className="toolbar-spacer" />

        <button className="button" onClick={() =>{console.log('click'); setIsInviteModalOpen(true)} }>
          Invite
        </button>

       <button
          className="button danger-button"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete board'}
        </button>

      </div>
      <div className="canvas-scroll">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
      />
      </div>
      <InviteModal
        boardId={boardId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />     
    </main>
  )
}

export default Board