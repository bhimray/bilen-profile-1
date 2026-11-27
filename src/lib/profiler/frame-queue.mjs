/** Coalesce refresh requests without postponing an already scheduled frame. */
export function createFrameQueue(callback, {setTimer=setTimeout,clearTimer=clearTimeout}={}) {
  let timer=null;
  return {
    get pending(){return timer!==null;},
    request(delay=30){
      if(timer!==null)return;
      timer=setTimer(()=>{timer=null;callback();},delay);
    },
    cancel(){if(timer!==null)clearTimer(timer);timer=null;},
  };
}
