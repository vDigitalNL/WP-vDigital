"use strict";

(function ($) {
  $(document).on('ready', function () {
    $.each($('.acf-code-field-box'), function () {
      // initialize
      if ($(this).parents(".acf-clone").length > 0) {
        return;
      }

      var editor = window.CodeMirror.fromTextArea($(this)[0], {
        lineNumbers: true,
        fixedGutter: false,
        mode: $(this).attr('mode'),
        theme: $(this).attr('theme'),
        extraKeys: {
          "Ctrl-Space": "autocomplete"
        },
        matchBrackets: true,
        styleSelectedText: true,
        autoRefresh: true,
        value: document.documentElement.innerHTML,
        viewportMargin: Infinity
      });
      editor.on('change', function () {
        editor.save();
      });
    });
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2YtZmllbGRzL0FjZkNvZGVGaWVsZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uICgkKSB7XG4gICQoZG9jdW1lbnQpLm9uKCdyZWFkeScsIGZ1bmN0aW9uICgpIHtcbiAgICAkLmVhY2goJCgnLmFjZi1jb2RlLWZpZWxkLWJveCcpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBpbml0aWFsaXplXG4gICAgICBpZiAoJCh0aGlzKS5wYXJlbnRzKFwiLmFjZi1jbG9uZVwiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGVkaXRvciA9IHdpbmRvdy5Db2RlTWlycm9yLmZyb21UZXh0QXJlYSgkKHRoaXMpWzBdLCB7XG4gICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICBmaXhlZEd1dHRlcjogZmFsc2UsXG4gICAgICAgIG1vZGU6ICQodGhpcykuYXR0cignbW9kZScpLFxuICAgICAgICB0aGVtZTogJCh0aGlzKS5hdHRyKCd0aGVtZScpLFxuICAgICAgICBleHRyYUtleXM6IHtcbiAgICAgICAgICBcIkN0cmwtU3BhY2VcIjogXCJhdXRvY29tcGxldGVcIlxuICAgICAgICB9LFxuICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICBzdHlsZVNlbGVjdGVkVGV4dDogdHJ1ZSxcbiAgICAgICAgYXV0b1JlZnJlc2g6IHRydWUsXG4gICAgICAgIHZhbHVlOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuaW5uZXJIVE1MLFxuICAgICAgICB2aWV3cG9ydE1hcmdpbjogSW5maW5pdHlcbiAgICAgIH0pO1xuICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVkaXRvci5zYXZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KShqUXVlcnkpOyJdLCJmaWxlIjoiYWNmLWZpZWxkcy9BY2ZDb2RlRmllbGQuanMifQ==
