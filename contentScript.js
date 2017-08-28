(function($){

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === "loaded?") {
        sendResponse({loaded: true});
      }
    }
  );

  $('body').prepend(
    $('<div/>', {
      class: 'pr-helper-overlay'
    })
  );

  const Suggestion = {

    storageName: null,
    $targetInput: null,
    $appendSelector: null,
    appendType: 'after', // options: 'after', 'before', 'prepend', 'append'

    init() {
      var selector = this.$targetInput.selector;
      this.$appendSelector = this.$appendSelector === null ? this.$targetInput : this.$appendSelector;
      $('body').on('keyup', selector, this, this.showSuggestions);
    },

    load(chromeStorage) {
      var storedEntities = chromeStorage[this.storageName];
      if (typeof storedEntities !== undefined) {
        var $_suggestionsSelectbox = this._compose(storedEntities);
        $('.adding-followers')[this.appendType]($_suggestionsSelectbox);
        $_suggestionsSelectbox.focus();
      } else {
        $('.adding-followers')
          .removeAttr('data-cursor-position')
          .removeClass('adding-followers');
      }
    },

    _compose(entities) {
      function _composeOptions(entities) {
        var $_options = $();
        entities.map(entity => {
          var $_option = $('<option/>', {
            text: ' ',
            'data-title': entity.title,
            'data-content': entity.content
          });
          $_options = $_options.add($_option);
        });
        return $_options;
      }
      var $_selectbox = $('<select/>', {
        class: 'pr-helper-suggestion',
        html: _composeOptions(entities)
      })
        .attr({'size': entities.length < 2 ? 2 : entities.length})
        .on('blur', function(){
          $(this).remove();
        })
        .on('click keydown', this, this.selectSuggestion);
      return $_selectbox;
    },

    showSuggestions(event) {
      var $targetInput = $(this);
      var val = $targetInput.val();
      var pos = $targetInput.prop("selectionStart");
      if (event.which === 52
        && (pos === 1 || val.charAt(pos-2).match(/\n|\s/))) {
          var suggestionObject = event.data;
          $targetInput
            .unbind('blur')
            .addClass('adding-followers')
            .attr('data-cursor-position', pos);
          chrome.storage.sync.get(suggestionObject.storageName, suggestionObject.load.bind(suggestionObject));
        }
    },

    selectSuggestion(event) {
      var rightArrowAndReturnKeyCodes = [13, 39];
      if (event.type === "click" || rightArrowAndReturnKeyCodes.indexOf(event.which) !== -1) {
        var currentSelectbox = this;
        var suggestionObject = event.data;
        event.stopPropagation();
        event.preventDefault();
        suggestionObject.handleSelectedSuggestion(currentSelectbox, suggestionObject);
        return false;
      }
    },

    handleSelectedSuggestion(currentSelectbox, suggestionObject) {
      var selectedContent = $(currentSelectbox).find('option:selected').attr('data-content');
      var $targetInput = $('.adding-followers:first');
      var val = $targetInput.val();
      var pos = $targetInput.attr('data-cursor-position');
      var posAfterInsert = parseInt(pos) + selectedContent.length - 1;

      $targetInput
        .val(val.substring(0, parseInt(pos) - 1) + selectedContent + val.substring(pos))
        .focus();
      $targetInput[0]
        .setSelectionRange(posAfterInsert, posAfterInsert);
      $targetInput
        .removeClass('adding-followers')
        .removeAttr('data-cursor-position');
      $(currentSelectbox).remove();
    },

    getCharacterPrecedingCaret(targetInput) {
      var precedingChar = "", sel, range, precedingRange;
      if (window.getSelection) {
          sel = window.getSelection();
          if (sel.rangeCount > 0) {
              range = sel.getRangeAt(0).cloneRange();
              range.collapse(true);
              range.setStart(targetInput, 0);
              precedingChar = range.toString().slice(-1);
          }
      } else if ( (sel = document.selection) && sel.type != "Control") {
          range = sel.createRange();
          precedingRange = range.duplicate();
          precedingRange.moveToElementText(targetInput);
          precedingRange.setEndPoint("EndToStart", range);
          precedingChar = precedingRange.text.slice(-1);
      }
      //return precedingChar;
      console.log(precedingChar);
    }
  }

  function createSuggestions(properties) {
    return Object.assign(Object.create(Suggestion), properties);
  }

  // Suggestions for PR description field

  const followersSuggestions = createSuggestions({
    storageName: 'reviewers',
    $targetInput: $('textarea.mentionable')
  });
  followersSuggestions.init();

})(jQuery);