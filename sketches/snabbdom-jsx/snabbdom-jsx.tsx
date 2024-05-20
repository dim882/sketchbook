import { h, Fragment, jsx, VNode } from 'snabbdom';
window.addEventListener('DOMContentLoaded', () => {
  const vNode: VNode = (
    <form>
      <div>
        foo!<div>baz</div>
      </div>
      bar
    </form>
  );
  console.log('Transformed VNode:', vNode);
});
