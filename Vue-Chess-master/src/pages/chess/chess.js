// inputs -> fen string
// outputs -> onmove, ongameover, oncapture, onstatechange

import Chessboard from '../../components/chessboard/chessboard.vue'
// import Socket from '../../services/chess-socket'
import StockfishApi from '../../services/stockfish-api'
import Chess from 'chess.js'

export default {
  name: 'chess',
  components: {
    Chessboard
  },
  data () {
    return {
      pgn: undefined,
      userid: Math.floor(Math.random() * 1000),
      side: 'w',
      twoplayer: false,
      iconDir: 'static/icons/'
    }
  },
  computed: {
    game () {
      const chess = Chess()
      chess.load_pgn(this.pgn)
      return chess
    }
  },
  created () {
    this.newGame()
    this.stockfishApi = new StockfishApi()
    // this.ai = new Ai()
    // this.socket = new Socket(this.userid)

    // this.socket.onNewMove((newMove) => {
    //   console.log(newMove)
    //   this.move(newMove.move)
    // })
  },
  methods: {
    newGame () {
      const chess = Chess()
      this.pgn = chess.pgn()
    },
    new960Game () {
      const chess = Chess()
      chess.clear();

      var freeSquares = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      var freePieces = ['k', 'q', 'r1', 'r2', 'b', 'b', 'n', 'n'];
      var shufflePieces = [];

      for(var i = 0; i < 8; i++) {
        var con = false;
        var bSet = '';
        while(!con) {
          var randomPiece = Math.floor(Math.random() * (8-i));
          if(freePieces[randomPiece] == 'r1') {
            if(freePieces.includes('r2')) {
              con = true;
            }
            else if(!freePieces.includes('k')) {
              con = true;
            }
          }
          else if(freePieces[randomPiece] == 'r2') {
            if(freePieces.includes('r1')) {
              con = true;
            }
            else if(!freePieces.includes('k')) {
              con = true;
            }
          }
          else if(freePieces[randomPiece] == 'k') {
            if(!freePieces.includes('r1') || !freePieces.includes('r2')) {
              con = true;
            }
          }
          else if(freePieces[randomPiece] == 'b') {
            console.log(bSet);
            console.log(i);
            if(bSet == '') {
              con = true;
              bSet = i;
            }
            else {
              if(i == 7) {
                shufflePieces.unshift(freePieces[randomPiece].charAt(0));
              }
              else {
                if(bSet % 2 != i % 2) {
                  con = true;
                }
              }
            }
          }
          else {
            con = true;
          }
          if(con) {
            shufflePieces.push(freePieces[randomPiece].charAt(0));
            freePieces.splice(randomPiece, 1);
          }
        }
      }
      for(var j = 0; j < 8; j++) {
        chess.put({ type: shufflePieces[j], color: 'w'}, freeSquares[j] + 1)
        chess.put({ type: shufflePieces[j], color: 'b'}, freeSquares[j] + 8)
        chess.put({ type: 'p', color: 'w'}, freeSquares[j] + 2)
        chess.put({ type: 'p', color: 'b'}, freeSquares[j] + 7)
      }
      this.pgn = chess.pgn()
    },
    boardChange (pgn) {
      this.pgn = pgn

      if (this.twoplayer) {
        setTimeout(this.swapSides, 1000)
      } else if (this.game.turn() !== this.side) {
        this.stockfishApi.getBestMove(this.game.fen()).then(response => {
          console.log(response)
          this.move(response.data)
        })
        // const history = this.game.history()
        // const lastMove = history[history.length - 1]
        // this.socket.emitMove(lastMove)
      }
    },
    swapSides () {
      if (this.side === 'w') {
        this.side = 'b'
      } else {
        this.side = 'w'
      }
    },
    randomMove () {
      const moves = this.game.moves()
      const move = moves[Math.floor(Math.random() * (moves.length - 1))]
      this.move(move)
    },
    move (move) {
      const result = this.game.move(move, {sloppy: true})
      console.log(result)
      this.pgn = this.game.pgn()
    },
    reset () {
      const chess = this.newGame()
      this.pgn = chess.pgn()
    },
    reset960 () {
      const chess = this.new960Game();
      this.pgn = chess.pgn()
    }
  }
}
