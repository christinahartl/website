function nJ() {

  return function(selector) {
    var nj = {
      nodes: []
    };

    nj.select = function(selector) {
      nj.nodes = document.querySelectorAll(selector);
      return nj;
    };

    nj.on = function(event, callback) {
      nj.each(function(el, i) {
        el.addEventListener(event, callback);
      });
      return nj;
    };

    nj.addClass = function(cls) {
      nj.each(function(el) {
        if (el.classList) {
          el.classList.add(cls);
        }
        else {
          el.className += ' ' + cls;
        }
      });
      return nj;
    };

    nj.toggleClass = function(cls) {
      nj.each(function(el, i) {
        if (el.classList) {
          el.classList.toggle(cls);
        }
        else {
          var classes = el.cls.split(' ');
          var existingIndex = classes.indexOf(cls);

          if (existingIndex >= 0) {
            classes.splice(existingIndex, 1);
          }
          else {
            classes.push(cls);
          }

          el.cls = classes.join(' ');
        }
      });
      return nj;
    };

    nj.removeClass = function(cls) {
      nj.each(function(el, i) {
        if (el.classList) {
          el.classList.remove(cls);
        }
        else {
          el.cls = el.cls.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
      });
      return nj;
    };

    nj.each = function(callback) {
      Array.prototype.forEach.call(nj.nodes, function(el, i){
        callback(el, i);
      });
      return nj;
    };

    nj.get = function(index) {
      return nj.nodes[index];
    };

    nj.css = function(property, value) {
      if (!property || !value) {
        return nj;
      }

      nj.each(function(el) {
        el.style[property] = value;
      });

      return nj;
    };

    nj.select(selector);

    return nj;
  };
}

var $ = new nJ();
$('.toggle-menu').on('click', function() {
  $('.navigation').css('top', scroll.currentScrollTop + 'px');
  $('html').toggleClass('show-menu');
});

$('.overlay').on('click', function() {
  $('html').removeClass('show-menu');
});

var cScroll = function(linkSelector, contentEndSelector) {
  this.linkSelector = linkSelector;
  this.contentEndSelector = contentEndSelector;
  this.sections = [];
  this.minBodyWidthForScrolling = 768;

  this.navClick = function(ev, el) {
    var html = $('html');
    var targetId = el.getAttribute('href').match(/\#.*$/).pop();
    var target = document.querySelectorAll(targetId);
    $('.toggle-menu').css('top', '0px');

    if (target && html.get(0).offsetWidth >= 768) {
      html
        .addClass('no-transition')
        .removeClass('show-menu');
      this.scrollToElement(target[0]);
      ev.preventDefault();
    }
    else {
      html
        .addClass('no-transition')
        .removeClass('show-menu');
      setTimeout(function() {
        html.removeClass('no-transition');
      }, 600);
    }
  };



  this.scrollToElement = function(el) {
    var startTop = this.scrollTop();
    var viewHeight = this.getViewHeight();
    var bodyHeight = document.documentElement.offsetHeight;
    // Constrain the scroll target to page boundaries.
    var targetTop = Math.max(this.getElementTop(el) * 0.95, 0);
    targetTop = Math.round(Math.min(targetTop, bodyHeight - viewHeight));
    var lastStep = new Date();
    var duration = 0.4;
    var that = this;



    zenscroll.toY(targetTop);

    return;
  };

  this.scrollTop  = function() { 
    return (window.scrollY || document.documentElement.scrollTop);
  };
  this.getViewHeight  = function() { 
    return window.innerHeight || document.documentElement.clientHeight;
  };

  this.getElementTop = function(el) {
    if (!el) {
      return 0;
    }
    return el.getBoundingClientRect().top + this.scrollTop() - document.documentElement.offsetTop;
  };

  this.getActiveLink = function() {
    if (this.sections.length < 1) {
      return document.querySelectorAll('#home')[0];
    }
    var scrollTop = this.scrollTop();
    var viewHeight = this.getViewHeight();
    var maxVisibleHeight = 0;
    var result = this.sections[0].link;
    for (var i=0;i<this.sections.length;i++) {
      var section = this.sections[i];
      var offsetTop = section.top - scrollTop;

      if (offsetTop < 0) { // The section start is not visible.
        visibleHeight = Math.min(section.height + offsetTop, viewHeight);
      }
      else {
        visibleHeight = Math.min(viewHeight - offsetTop, viewHeight);
      }

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        result = section.link;
      }
    }
    return result;
  };

  this.updateLinkValues = function() {
    // We calculate the approximate height by subtracting the current headline's
    // top from the next element's top value and starting with an element after the content. (therefor contentEndSelector)
    // This is why this loop starts at the end.
    var lastTop = this.getElementTop(document.querySelector(this.contentEndSelector));
    for (var i=this.sections.length-1;i>=0;i--) {
      var currentTop = this.getElementTop(this.sections[i].target);
      this.sections[i].top = currentTop;
      this.sections[i].height = lastTop - currentTop;
      lastTop = currentTop;
    }
  };

  this.init = function() {
    var links = document.querySelectorAll(this.linkSelector);
    if (!links) {
      return;
    }

    var that = this;
    var clickHandler = function(ev) {
      return that.navClick(ev, this);
    };

    var link, href;
    for (var i=0;i<links.length;i++) {
      link = links[i];
      href = link.getAttribute('href');

      if (!href) {
        continue;
      }

      var targetId = link.getAttribute('href').match(/\#.*$/);
      if (!targetId) {
        continue;
      }
      targetId = targetId.pop();

      this.sections.push({
        link: links[i],
        target: document.querySelector(targetId)
      });
      link.addEventListener('click', clickHandler);
    }
    this.updateLinkValues();

    window.addEventListener('resize', function() {
      that.updateLinkValues();
    });

    window.addEventListener('scroll', function() {
      var oldActive = document.querySelector('.navigation .active');
      if (oldActive) {
        oldActive.setAttribute('class', oldActive.getAttribute('class').replace(/\s*active/, ''));
      }
      var active = that.getActiveLink().parentNode;
      var cls = active.getAttribute('class') || '';
      if (!cls.match(/\s*active/)) {
        active.setAttribute('class', cls + (cls.length > 1 ? ' ' : '') + 'active');
      }

      that.currentScrollTop = that.scrollTop();
    });

    this.currentScrollTop = this.scrollTop();
  };

  this.init();
};
var scroll = new cScroll('a[href^="#"]', '.footer');