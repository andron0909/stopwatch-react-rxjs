import React, { useEffect, useRef, useState } from "react";
import { interval, fromEvent } from "rxjs";
import { map, buffer, filter, debounceTime } from "rxjs/operators";
import { stopwatchService as sws } from "./services/stopwatch";
import { useObservable } from "./components/useObservalble";

import "./App.css";

function App() {
  const s = useObservable(sws.s);
  const m = useObservable(sws.m);
  const h = useObservable(sws.h);

  const waitBtn = useRef(null);

  const go = (v) => {
    if (v === 0) {
      sws.setS(0);
      sws.setM(0);
      sws.setH(0);
      return;
    }

    if (sws.getM() === 60) {
      sws.setH(sws.getH() + 1);
      sws.setM(0);
    }

    if (sws.getS() === 60) {
      sws.setM(sws.getM() + 1);
      sws.setS(0);
    }

    sws.setS(sws.getS() + 1);
  };

  const [runStopwatch, setRunStopwatch] = useState(false);
  const [wait, setWait] = useState(false);

  useEffect(() => {
    if (runStopwatch) {
      const run$ = interval(1000).subscribe(() => {
        go();
      });

      return () => run$.unsubscribe();
    } else {
      if (!wait) go(0);
    }
  }, [runStopwatch, wait]);

  useEffect(() => {
    const waitBtnClick$ = fromEvent(waitBtn.current, "click").pipe(
      buffer(fromEvent(waitBtn.current, "click").pipe(debounceTime(300))),
      map((list) => list.length),
      filter((x) => x === 2)
    );
    waitBtnClick$.subscribe(() => {
      setWait(true);
      setRunStopwatch(false);
    });
  }, []);

  const startStopBtnHandler = () => {
    if (wait) {
      setWait(false);
      setRunStopwatch(true);
    } else {
      setRunStopwatch((prev) => !prev);
    }
  };

  const resetBtnHandler = () => {
    go(0);
    setWait(false);
    setRunStopwatch(true);
  };

  return (
    <div className="stopwatch">
      <h1>Секундомер</h1>
      <h2>{`
      ${h < 10 ? "0" + h : h}
      :
      ${m < 10 ? "0" + m : m}
      :
      ${s < 10 ? "0" + s : s}
      `}</h2>
      <div className="buttons">
        <button className="btn" onClick={startStopBtnHandler}>
          {runStopwatch ? "Stop" : "Start"}
        </button>
        <button className="btn" ref={waitBtn} title="Нажмите два раза">
          Wait
        </button>
        <button className="btn" onClick={resetBtnHandler}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;
