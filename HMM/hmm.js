// Hidden markov model
//

const states = [1, 2, 3]; // boxes
const observations = ['red', 'white']; // color of balls

// The prior probability of get a ball from which box
// box1: 0.2, box2: 0.4, box3: 0.4
// Matrix PI
const priorProbability = [0.2, 0.4, 0.4];

// Matrix A
// If we get ball from a box, then the probability
// we will get from another boxes
// row1 for box1, row2 for box2, row3 for box3
// Size: Sizeof(states) * Sizeof(states)
const transProbability = [
  [0.5, 0.2, 0.3],
  [0.3, 0.5, 0.2],
  [0.2, 0.3, 0.5],
];

// Matrix B
// The probability of get color ball from boxes
// e.g. row1 for box1 to get red and then white ball
// Size: Sizeof(states) * Sizeof(observations)
const emissionProbability = [
  [0.5, 0.5],
  [0.4, 0.6],
  [0.7, 0.3],
];

const observationQueue = ['red', 'white', 'red'];

// Problem 1, get the probability of observationQueue
function forward() {
  let result = [];
  for (var i = 0; i < observationQueue.length; i++) {
    result[i] = [];

    const observation = observationQueue[i];

    for (var j = 0; j < states.length; j++) {
      const index = observations.indexOf(observation);
      const bp = emissionProbability[j][index] || 0;
      if (i == 0) {
        result[i][j] = priorProbability[j] * bp;
      } else {
        let pre_state_probability = 0;
        // const pre_state_probability =
        //   result[i-1][0] * transProbability[0][j]
        //   + result[i-1][1] * transProbability[1][j]
        //   + result[i-1][2] * transProbability[2][j];
        for (var k = 0; k < states.length; k++) {
          pre_state_probability += result[i-1][k] * transProbability[k][j];
        }

        result[i][j] = pre_state_probability * bp;
      }
    }
  }

  console.log('Result of probabilitys', result);

  let sum_probability = 0;
  for (var i = 0; i < result[result.length - 1].length; i++) {
    sum_probability += result[result.length - 1][i];
  }
  console.log(`Qbservation queue ${observationQueue} probability is`, sum_probability);
  console.assert(result.length == 3, 'result length should be ' + observationQueue.length);
}

function viterbi() {
  let result = [];
  for (var i = 0; i < observationQueue.length; i++) {
    result[i] = [];

    const observation = observationQueue[i];

    for (var j = 0; j < states.length; j++) {
      const index = observations.indexOf(observation);
      const bp = emissionProbability[j][index] || 0;
      if (i == 0) {
        result[i][j] = priorProbability[j] * bp;
      } else {
        const prevMaxStateProbality = Math.max.call(...result[i-1]);
        const prevMaxStateProbalityIndex = result[i-1].indexOf(prevMaxStateProbality);
        result[i][j] = prevMaxStateProbality * transProbability[prevMaxStateProbalityIndex][j] * bp;
      }
    }
  }

  let statesList = [];
  for (var i = 0; i < result.length; i++) {
    const maxStateProbality = Math.max.call(...result[i]);
    const maxStateProbalityIndex = result[i].indexOf(maxStateProbality);
    statesList.push(states[maxStateProbalityIndex])
  }

  console.log('Result of probability', result);
  console.log('Result of states with max probability', statesList);

  console.assert(result.length == 3, 'result length should be ' + observationQueue.length);
}

forward();

viterbi();
