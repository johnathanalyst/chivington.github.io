/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: GitHub Web App                                                           *
 * Description: Math lib for my GitHub app.                                          *
 * --------------------------------------------------------------------------------- */

// Lines Object Constructor
 function Lines() {
   //
   return {
     pointSlope: function(p1, p2) {
       return function(form = "DEFAULT") {
         const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
         const m = (y2-y1) / (x2-x1);
         return this[form] ? this[form](x1, y1, x2, y2, m) : this.pointSlope(p1, p2);
       }
     },

   }

 }
