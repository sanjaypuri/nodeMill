const express = require('express');
const { render } = require('ejs');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', (request, response)=>{
  response.render('home', {})
});

app.get('/newschedule', (request, response)=>{
  let sql = `SELECT * FROM materials`;
  db.all(sql, (error, materials)=>{
    if(error){
      console.log(`Error reading database. Error: ${error.message}`);
    } else {
      response.render('newschedule', {materials});
    }
  })
});

app.post('/result', (request, response)=>{
  const M = 1;
  const M1 = 1;
  const PI = 3.14159265;
  const project = request.body.project;
  const milltype = parseInt(request.body.milltype);
  const D = parseFloat(request.body.wrdia);
  let T = parseFloat(request.body.entrytension);
  let X = parseFloat(request.body.exittension);
  let materialno = parseInt(request.body.materialSelect);
  let tensionType = parseInt(request.body.tensionSelect);
  let R = parseFloat(request.body.annealgauge);
  let F = parseFloat(request.body.stripwidth);
  let A1 = parseFloat(request.body.coilweight);
  let G = parseFloat(request.body.entrygauge);
  let H = parseFloat(request.body.exitgauge);
  let V = parseFloat(request.body.exitspeed);

  let sql = `SELECT * FROM materials WHERE id = ?`;
  db.get(sql, materialno, (error, material)=>{
    if(error){
      console.log(`Error reading database. Error: ${error.message}`);
    } else {
      const I1 = 25.4;
      let R1 = (D/2)/I1;
      let D1 = 0;
      F = F / I1;
      T = T*2.2;
      X = X*2.2;
      G = G/I1;
      R = R/I1;
      A1 = A1*2.2;
      V = V/0.3048;
      H = H/I1;
      S = (material.v8/1.82)*1420;
      let B = 1 + 5 * (1 - (G + H) / 2 / R);
      let B1 = 0;
      let S0 = 0;
      let U = 0.0;
      let K = material.v9
      if(B>2){
        B1 = parseInt(B);
        S0 = (K*(B1)+(B - B1)*(K*(B1 + 1)-K*(B1))) * 1000;
      } else {
        B1 = parseInt(2*B) - 2;
        S0 = (K*(B1)+(2*(B-1)-B1)*(K*(B1+1)-K*(B1))) * 1000;
      }
      let Y = X / F / H;
      let W = T / F / G;
      if(tensionType === 1){
        Y = (Y + S)/2 - Math.abs(Y-S)/2;
        W = (W + Y * H / G) / 2 - Math.abs(W - Y * H / G)/2;
        if(M == 2 && G > 0.04){
          W = 0.75 * W;
        }
        U = 0.009000001 - 0.000095 * V;
        let U1 = 0.042 - 0.00002 * V;
        let U2 = 0.021 - 0.0000014 * V;
        if(U < U1){
          U = U1;
        }
        if(U < U2){
          U = U2;
        }
      } else {
        U = 187000.0 - 73 * V + Math.abs(53000.0 - 53 * V);
        U = (U + 94000.0 + Math.abs(U - 94000.0))/4000000.0;
      }
      let L = Math.sqrt(R1 * (G - H));
      let L2 = (2 * U * L / (G + H))*(2 * U * L / (G + H));
      let A = 7.28 * R1 / PI / 30000000;
      let L1 = 4 * A * U * (S0 - W/2 - Y/2) / (G +H);
      L1 = L1 - L2;
      if (L1 > 0.932){
        alert("Attempted reduction Impossible");
        return;
      }
      let Q1 = (L1 + Math.sqrt(L1*L1 + 3.888*L2)) / 1.944;
      let Q2 = (L2 + 0.23) / (0.947 - L1);
      let Q3 = (L2 + 0.1) / (0.772 - L1);
      let Q = Math.abs(Q2 - 0.475) - Math.abs(Q1 - 0.475) - Math.abs(Q2- 0.74) + Math.abs(Q3 - 0.74);
      Q = (Q + Q1 + Q3) / 2;
      if(Q > 0.93){
        alert("Attempted reduction Impossible");
        return;
      }
      let L3 = Q + 1.59 * Q * Q * Q;
      let L4 = (Math.exp(L3) - 1) / L3; 
      let P3 = L4 * (S0 - W/2 - Y/2);
      let L5 = L3 * (G + H)/2/U;
      let P = P3*L5;
      let N3 = V * F / 33000.0
      let N4 = P * Math.pow(milltype, 0.7) / 900 + (P3 + W) *   (G - H);
      let C = N4 * N3;
      let E = C + N3 * H * (W - Y);
      const I2 = 1420;
      P = P / 55.88;
      C = C * 0.746;
      E = E * 0.746;
      A1 = A1/2.2;
      let DM15 = 2.2 * (A1) / (12 * V * F * H * K);
      let R6 = 100 * (1 - H / G);
      let R2 = 100 * (1 - H / R);
      let R3 = 100 * (S0 - W/2 - Y/2) * (G - H) / N4;
      let R4 = W * F * G /2.2;
      let R5 = Y * F * H / 2.2;
      V = V*0.3048;
      let V3 = R5 * (V) / 6131 / 0.95;
      S0 = S0 / I2;
      E = E / 0.95;
      Y = Y / I2;
      // console.log({project, D, });
      H = H*I1;
      V = V*0.3048;
      response.send({
        "Pass":M, 
        "Exit Gauge":H, 
        "Reduction":R6,
        "Total Reduction":R2,
        "Pass Speed":V,
        "Mill Eqqiciency":R3,
        "Spec Press":S0,
        "Entry Texsion":R4,
        "Exit Stress":Y,
        "Exit Tension":R5,
        "Exit Power":V3,
        "Mill Power":E,
        "Rolling Power":C,
        "Rolling Load":P,
      });    }
  });



});

app.listen(5000, (error)=>{
  if(error){
    console.log(`Server could not be started. Error: ${error.message}`);
  } else {
    console.log(`Server running at port 5000`);
  }
});