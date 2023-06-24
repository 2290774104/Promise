const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
// 此函数主要的目的是判断x 是不是promise
// 规范中说明 我们的promise可以和别人的promise互通
function resolvePromise(x, promise2, resolve, reject) {
  // 用x 的值来决定promise2 是成功还是失败 (resolve,reject)
  if (x === promise2) {
    return reject(
      new TypeError(
        "[TypeError: Chaining cycle detected for promise #<Promise>] error"
      )
    );
  }
  // promise实例要么是对象要么是函数
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    let called = false;
    try {
      let then = x.then; // 看是否有then方法
      if (typeof then === "function") {
        // 不用每次都取值了,直接用上次取到的结果
        then.call(
          x,
          (y) => {
            // 别人家的promise
            if (called) return;
            called = true;
            resolvePromise(y, promise2, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x); // {then:{}}  | {} | function
      }
    } catch (e) {
      // 别人家的promise
      if (called) return;
      called = true;
      reject(e); // 取值出错
    }
  } else {
    // 说明x是一个普通值
    resolve(x); // 普通值直接向下传递即可
  }
}
class Promise {
  constructor(executor) {
    // 默认 promise 的状态为 PENDING
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolveCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      // 只有 pending 状态才可以修改状态
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        this.onResolveCallbacks.forEach((fn) => fn());
      }
    };

    const reject = (reason) => {
      // 只有 pending 状态才可以修改状态
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      // 如果executor执行发生异常 就默认等价reject方法
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    // then方法中如果没有传递参数 那么可以透传到下一个then中
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        process.nextTick(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(x, promise2, resolve, reject);
          } catch (e) {
            console.log(e);
            reject(e);
          }
        });
      }
      if (this.status === REJECTED) {
        process.nextTick(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(x, promise2, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.status === PENDING) {
        // 调用then的时候promise没成功也没失败
        this.onResolveCallbacks.push(() => {
          process.nextTick(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(x, promise2, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          process.nextTick(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(x, promise2, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });
    return promise2;
  }
}
Promise.deferred = function () {
  const dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
// npm install promises-aplus-tests -g
module.exports = Promise;
