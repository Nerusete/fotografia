(function () {
  'use strict';

  var resizeSnippet =
    '<script>(function(){' +
    'function send(){parent.postMessage({ewFrameHeight:document.documentElement.scrollHeight,ewAutoResize:true},"*");}' +
    'if(typeof ResizeObserver!=="undefined"){new ResizeObserver(send).observe(document.body);}' +
    'window.addEventListener("load",send);' +
    'send();' +
    '})()</scr' + 'ipt>';

  function initWidget(widget) {
    if (!widget) return;
    var frame = widget.querySelector('iframe.ewhtml-frame');
    var source = widget.querySelector('textarea.ewhtml-store');
    if (!frame || !source) return;

    var html = source.value || '';

    // Only append resize snippet if auto-resize is enabled
    if (frame.getAttribute('data-autoresize') === 'true') {
      html += resizeSnippet;
    }

    if (frame.hasAttribute('sandbox')) {
      if ('srcdoc' in frame) {
        frame.srcdoc = html;
      } else {
        if (frame.contentWindow && frame.contentWindow.document) {
          var d = frame.contentWindow.document;
          d.open();
          d.write(html);
          d.close();
        }
      }
    } else {
      if (frame.contentWindow && frame.contentWindow.document) {
        var doc = frame.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
      }
    }

    if (source.parentNode) {
      source.parentNode.removeChild(source);
    }
  }

  function initAll() {
    var shadows = document.querySelectorAll('.ewhtml-shadow');
    for (var s = 0; s < shadows.length; s++) {
      var tpl = shadows[s].querySelector('template');
      if (!tpl) continue;
      var shadow = shadows[s].attachShadow({ mode: 'open' });
      shadow.innerHTML = tpl.innerHTML;
      tpl.remove();
    }

    var widgets = document.querySelectorAll('.ewhtml-widget:not(.ewhtml-shadow)');
    for (var i = 0; i < widgets.length; i++) {
      initWidget(widgets[i]);
    }
  }

  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.ewFrameHeight) return;
    var iframes = document.querySelectorAll('.ewhtml-frame');
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow === e.source) {
        // Only resize if auto-resize is enabled
        if (iframes[i].getAttribute('data-autoresize') === 'true') {
          var h = e.data.ewFrameHeight + 'px';
          iframes[i].style.height = h;
          var pos = iframes[i].closest('[id$="_pos"]');
          if (pos) pos.style.height = h;
        }
        break;
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();