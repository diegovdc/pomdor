const play = require('play');
const Task = require('data.task')
const argv = require('yargs').argv
const {
  pipe, 
  map,
  flatten,
  reduce,
  range,
  isNil,
} = require('ramda')
const log = console.log

//debug
const tap = x => {log(x); return x}

const help = () =>  log(`
    Ejemplo de uso: pomdor -l 45  -c 5 -r 3

    l       Duración del ciclo largo en minutos
    c       Duración del ciclo largo en corto en minutos
    r       Número de repeticiones
    s       Shorthand <l>/<c>/<r>
    p       Presets
    h       ayuda
`)

let {l, c, r, p, s} = argv

let presets = {
  netflix: {
    l: 120,
    c: 1,
    r: 1,
  },
  equal: {
    l: l,
    c: l,
    r: r,
  }
}

if(argv.h) {
  help()
  return
} else if(presets[p]) {
  ({l, c, r} = presets[p])
} else if(s.split('/').length >= 2) {
  ([l, c, r] = s.split('/').map(Number))
} else if(isNil(l) || isNil(c)) {
  log('\nHubo un error al usar a pomdor \n\n')
  log('Ayuda:')
  help()
  return
}

const makeCycle = cycle =>  new Task((rej, res) => {
  log(`cíclo: ${cycle.type} #${cycle.round}`)
  if(cycle.type === 'largo' && cycle.round !== 0) { play.sound(__dirname+'/2.mp3'); }
  if (cycle.type === 'corto') { play.sound(__dirname +'/3.mp3'); }
  setTimeout(() => {
    res()
  }, cycle.time)
})

const sequence = pipe(
  reps => map(round => [
      {time: l*1000*60, type: 'largo', round}, 
      {time: c*1000*60, type: 'corto', round}
    ], 
    range(0, reps)),
  flatten,
  map(makeCycle)
)
(r || 1)

//sequencer :: Task -> Task -> Task
const sequencer = (fst, snd) => fst.chain(_ => snd)

//run
reduce(sequencer, Task.of(log('inicia pomodoro')), sequence).fork(log, log)
