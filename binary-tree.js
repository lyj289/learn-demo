//https://juejin.im/post/6844904063650234375

var node4 = {left: null, right: null, val: 4 };
var node5 = {left: null, right: null, val: 5 };
var node6 = {left: null, right: null, val: 6 };
var node7 = {left: null, right: null, val: 7 };
var node3 = {left: node6, right: node7, val: 3 };
var node2 = {left: node4, right: node5, val: 2 };
var node1 = {left: node2, right: node3, val: 1 };
var root = node1;

//      1
//    /  \
//   2    3
//  / \   / \
// 4   5  6  7

// 中序遍历
var inorderTraversal = function (root) {
  var cur = root;
  var stack = [];
  var ret = [];
  var i = 0;

  while (cur || stack.length) {
    if (i++ > 30) break;

    if (cur) {
      stack.push(cur);
      cur = cur.left;
    } else {
      const node = stack.pop();
      ret.push(node.val);
      cur = node.right;
    }
  }

  console.log(ret); // [ 4, 2, 5, 1, 6, 3, 7 ]
}

var preorderTraversal = function (root) {
  var cur = root;
  var stack = [root];
  var ret = [];
  var i = 0;

  while (stack.length) {
    if (i++ > 30) break;

    cur = stack.pop();

    ret.push(cur.val);

    if (cur.right) {
      stack.push(cur.right);
    }

    if (cur.left) {
      stack.push(cur.left);
    }
  }

  console.log(ret); // [ 1, 2, 4, 5, 3, 6, 7 ]
}


var postorderTraversal = function(root) {
  if (!root) return null;
  const rer = [];
  const stack = [root];
  // 倒序插入
  while (stack.length) {
    const cur = stack.pop();
    // 总是头部插入，先被插入的在后面。
    rer.unshift(cur.val);
    cur.left && stack.push(cur.left);
    cur.right && stack.push(cur.right);
  }

  console.log(rer); // [ 4, 5, 2, 6, 7, 3, 1 ]
};

postorderTraversal(root);
