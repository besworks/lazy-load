let tag = 'lazy-load';

let content = `
  <style>
    a#trigger {
      display: block;
      padding: 1em;
      text-align: center;
      font-size: 4em;
      background: darkgrey;
      color: #555;
      text-decoration: none;
    }

    .one {
      opacity: 0;
      animation: dot 1.3s infinite;
      animation-delay: 0.0s;
    }

    .two {
      opacity: 0;
      animation: dot 1.3s infinite;
      animation-delay: 0.2s;
    }

    .three {
      opacity: 0;
      animation: dot 1.3s infinite;
      animation-delay: 0.3s;
    }

    @keyframes dot {
        0% { opacity: 0; }
       50% { opacity: 1; }
      100% { opacity: 0; }
    }
  </style>
  <a id="trigger">
    <span class="one">.</span>
    <span class="two">.</span>
    <span class="three">.</span>
  </a>
`;

class Bit extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode : 'open' });
    this.shadowRoot.innerHTML = content;
  }
  
  connectedCallback() {
    let widget = this;
    
    let href = widget.getAttribute('href');
    if (!href) { return; }
    
    let trigger = widget.shadowRoot.querySelector('a#trigger');
    trigger.href = href;

    document.addEventListener('scroll', detectPosition);
    
    function detectPosition() {
      let r = widget.getBoundingClientRect();
      if (r.top <= window.innerHeight + 50) {
	      lazyLoad();
      }
    }

    function lazyLoad() {
      console.log('loading...', href);

      let xhr = new XMLHttpRequest();
      xhr.open('GET', href);

      xhr.addEventListener('load', event => {
        if (xhr.status !== 200) {
          return;
        }
        let r = document.createRange();
        let f = r.createContextualFragment(xhr.responseText);
        if (f && trigger && trigger.parentNode) {
          trigger.parentNode.replaceChild(f, trigger);
        }
        if (widget.id) {
          let hash = `#${widget.id}`;
          history.pushState({}, hash, hash);
        }
        document.removeEventListener('scroll', detectPosition);
      });
      
      xhr.send();
    }
  }
}

customElements.define(tag, Bit);
