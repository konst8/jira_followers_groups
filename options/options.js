'use strict';

(function ($){
  
  const Entity = {

    $container: null,
    $add: null,
    titleHelpText: null,
    contentHelpText: null,
    cssClass: null,

    init() {
      chrome.storage.sync.get(this.name, this.load.bind(this));
      this.$add.on('click', this.add.bind(this));
      this.$container.sortable();
      $('button#save').on('click', this.save.bind(this));
    },

    _compose(title = '', content = '') {
      var collapsed = content !== '' ? ' collapsed' : '';
      var $_entity = $('<div/>', {
        class: 'entity ui-state-default ' + this.cssClass + collapsed,
        html: [
          $('<span/>', {
            class: 'close-trigger ui-icon ui-icon-close'
          })
            .on('click', function(){
              $(this).closest('.entity').remove();
            }),
          $('<span/>', {
            class: 'expand-trigger ui-icon ui-icon-caret-1-s'
          })
            .on('click', function(){
              $(this).closest('.entity').toggleClass('collapsed')
                .find('.content')
                  .attr('data-title', $(this).siblings('.content').find('input').val())
                  .attr('data-content', $(this).siblings('.content').find('textarea').val());
            }),
          $('<span/>', {
            class: 'ui-icon ui-icon-arrow-4'
          }),
          $('<div/>', {
            class: 'content',
            'data-title': title,
            'data-content': content,
            html: [
              $('<input/>', {
                type: 'text',
                placeholder: this.titleHelpText
              })
                .val(title),
              $('<textarea/>', {
                rows: 5,
                placeholder: this.contentHelpText
              })
                .val(content)
            ]
          })
        ]
      })
      return $_entity;
    },

    add() {
      this.$container.append(this._compose());
    },

    remove() {
      this.closest('.entity').remove();
    },

    load(chromeStorage) {
      var storedEntities = chromeStorage[this.name];
      if (storedEntities !== undefined) {
        var $_container = $();
        storedEntities.map(entity => {
          $_container = $_container.add(this._compose(entity.title, entity.content));
        });
        this.$container.html($_container);
      } else {
        this.$container.html(this._compose());
      }
    },

    save() {
      var entities = [];
      var $entity = $('.entity', this.$container);
      $entity.each(function(){
        var title = $('input', this).val();
        var content = $('textarea', this).val();
        if (content === '') {
          return true;
        }
        var data = {
          'title': $('input', this).val(),
          'content': $('textarea', this).val()
        }
        entities.push(data);
      });
      chrome.storage.sync.set({
        [this.name]: entities }, function(){
          window.close();
      });
    }
  };

  function createEntity(properties) {
    return Object.assign(Object.create(Entity), properties);
  }

  // Init reviewers (followers) object

  const reviewers = createEntity({
    name: 'reviewers',
    $container: $('.reviewers'),
    $add: $('a#add-reviewers'),
    titleHelpText: "Set some title for the group",
    contentHelpText: "Add followers in Jira format, e.g. [~bgates], [~sjobs], [~emusk], [~kmishur]",
    cssClass: "reviewers-entity"
  });
  reviewers.init();

})(jQuery)
