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
    h       ayuda
`)

if(argv.h) {
  help()
  return
} else if(isNil(argv.l) || isNil(argv.c) || isNil(argv.r)) {
  log('\nHubo un error al usar a pomdor \n\n')
  log('Ayuda:')
  help()
  return
}

const makeCycle = cycle =>  new Task((rej, res) => {
  log(`cíclo: ${cycle.type} #${cycle.round}`)
  if(cycle.type === 'largo' && cycle.round !== 0) { play.sound('./1.mp3'); }
  if(cycle.type === 'corto') { play.sound('./1.mp3'); }
  setTimeout(() => {
    res()
  }, cycle.time)
})

const sequence = pipe(
  reps => map(round => [
      {time: argv.l*1000*60, type: 'largo', round}, 
      {time: argv.c*1000*60, type: 'corto', round}
    ], 
    range(0, reps)),
  flatten,
  map(makeCycle)
)
(argv.r)

let sequencer = (fst, snd) => fst.chain(_ => snd)

//run
reduce(sequencer, Task.of(log('inicia')), sequence).fork(log, log)
