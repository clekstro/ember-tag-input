import Ember from 'ember';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { typeInInput, typeCharacterInInput } from '../../helpers/ember-tag-input';

const KEY_CODES = {
  BACKSPACE: 8
};

module('tag-input', 'Integration | Component | Ember Tag Input', function(hooks) {
  setupRenderingTest(hooks);

  test('New tags are created when delimiter characters are typed', async function(assert) {
    assert.expect(4);

    const tags = Ember.A();

    this.addTag = function(tag) {
      tags.pushObject(tag);
    };
    this.set('tags', tags);

    await render(hbs`
      {{#tag-input
        tags=tags
        addTag=(action addTag)
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    const done = assert.async();

    Ember.run(() => {
      typeInInput('.js-ember-tag-input-new', 'first second ');

      Ember.run.next(() => {
        assert.equal($('.js-ember-tag-input-new').text(), '');
        assert.equal($('.emberTagInput-tag').length, 2);
        assert.equal($('.emberTagInput-tag').eq(0).text().trim(), 'first');
        assert.equal($('.emberTagInput-tag').eq(1).text().trim(), 'second');
        done();
      });
    });
  });

  test('New tags are created when the field is blurred', async function(assert) {
    assert.expect(3);

    const tags = Ember.A();

    this.addTag = function(tag) {
      tags.pushObject(tag);
    };
    this.set('tags', tags);

    await render(hbs`
      {{#tag-input
        tags=tags
        addTag=(action addTag)
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    const done = assert.async();

    Ember.run(() => {
      typeInInput('.js-ember-tag-input-new', 'blurry');

      $('.js-ember-tag-input-new').blur();

      Ember.run.next(() => {
        assert.equal($('.js-ember-tag-input-new').text(), '');
        assert.equal($('.emberTagInput-tag').length, 1);
        assert.equal($('.emberTagInput-tag').eq(0).text().trim(), 'blurry');
        done();
      });
    });
  });

  test('Tags can be removed using the backspace key', async function(assert) {
    assert.expect(5);

    const tags = Ember.A();

    this.addTag = function(tag) {
      tags.pushObject(tag);
    };
    this.removeTagAtIndex = function(index) {
      tags.removeAt(index);
    };
    this.set('tags', tags);

    await render(hbs`
      {{#tag-input
        tags=tags
        addTag=(action addTag)
        removeTagAtIndex=(action removeTagAtIndex)
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    const done = assert.async();

    Ember.run(() => {
      typeInInput('.js-ember-tag-input-new', 'removeme ');

      Ember.run.next(() => {
        assert.equal($('.js-ember-tag-input-new').text(), '');
        assert.equal($('.emberTagInput-tag').length, 1);

        typeCharacterInInput('.js-ember-tag-input-new', String.fromCharCode(KEY_CODES.BACKSPACE));

        Ember.run.next(() => {
          assert.equal($('.emberTagInput-tag').length, 1);
          assert.equal($('.emberTagInput-tag--remove').length, 1);

          typeCharacterInInput('.js-ember-tag-input-new', String.fromCharCode(KEY_CODES.BACKSPACE));

          Ember.run.next(() => {
            assert.equal($('.emberTagInput-tag').length, 0);
            done();
          });
        });
      });
    });
  });

  test('Tags can contain spaces when allowSpacesInTags is set to true', async function(assert) {
    assert.expect(3);

    const tags = Ember.A();

    this.addTag = function(tag) {
      tags.pushObject(tag);
    };
    this.set('tags', tags);

    await render(hbs`
      {{#tag-input
        tags=tags
        addTag=(action addTag)
        allowSpacesInTags=true
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    const done = assert.async();

    Ember.run(() => {
      typeInInput('.js-ember-tag-input-new', 'multiple words rock');

      $('.js-ember-tag-input-new').blur();

      Ember.run.next(() => {
        assert.equal($('.js-ember-tag-input-new').text(), '');
        assert.equal($('.emberTagInput-tag').length, 1);
        assert.equal($('.emberTagInput-tag').eq(0).text().trim(), 'multiple words rock');
        done();
      });
    });
  });

  test('Tags can\'t be added or removed in read only mode', async function(assert) {
    assert.expect(5);

    const tags = Ember.A(['hamburger', 'cheeseburger']);
    this.set('tags', tags);

    await render(hbs`
      {{#tag-input
        tags=tags
        readOnly=true
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    assert.equal($('.emberTagInput-tag').length, 2);
    assert.equal($('.emberTagInput-remove').length, 0);
    assert.equal($('.emberTagInput-new').length, 1);

    const $input = $('.emberTagInput-new input');
    assert.equal($input.length, 1);
    assert.ok($input.prop('disabled'));
  });

  test('send input value when typing', async function(assert) {
    const tags = Ember.A();

    this.addTag = function(tag) {
      tags.pushObject(tag);
    };

    this.set('tags', tags);

    let inputValue;

    this.onKeyUp = function(value) {
      inputValue = value;
    };

    await render(hbs`
      {{#tag-input
        tags=tags
        addTag=(action addTag)
        onKeyUp=(action onKeyUp)
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    const done = assert.async();

    Ember.run(() => {
      typeCharacterInInput('.js-ember-tag-input-new', 't', 'keyup');
      assert.equal(inputValue, 't');
      typeCharacterInInput('.js-ember-tag-input-new', 'e', 'keyup');
      assert.equal(inputValue, 'te');
      typeCharacterInInput('.js-ember-tag-input-new', 's', 'keyup');
      assert.equal(inputValue, 'tes');
      $('.js-ember-tag-input-new').blur();

      Ember.run.next(() => {
        assert.equal($('.emberTagInput-tag').length, 1);
        assert.equal($('.emberTagInput-tag').eq(0).text().trim(), 'tes');
        assert.equal(inputValue, '');
        done();
      });
    });
  });

  test('Tags can be added after readOnly changes to false', async function(assert) {
    assert.expect(4);

    const tags = Ember.A();

    this.addTag = function(tag) {
      tags.pushObject(tag);
    };
    this.set('tags', tags);
    this.set('readOnly', true);

    await render(hbs`
      {{#tag-input
        tags=tags
        addTag=(action addTag)
        readOnly=readOnly
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    const done = assert.async();

    Ember.run(() => {
      this.set('readOnly', false);

      typeInInput('.js-ember-tag-input-new', 'some tag ');

      Ember.run.next(() => {
        assert.equal($('.js-ember-tag-input-new').text(), '');
        assert.equal($('.emberTagInput-tag').length, 2);
        assert.equal($('.emberTagInput-tag').eq(0).text().trim(), 'some');
        assert.equal($('.emberTagInput-tag').eq(1).text().trim(), 'tag');
        done();
      });
    });
  });

  test('Tags can\'t be added or removed after readOnly changes from false to true', async function(assert) {
    assert.expect(5);

    const tags = Ember.A(['hamburger', 'cheeseburger']);
    this.set('tags', tags);
    this.set('readOnly', false);

    await render(hbs`
      {{#tag-input
        tags=tags
        readOnly=true
        as |tag|
      }}
        {{tag}}
      {{/tag-input}}
    `);

    const done = assert.async();

    Ember.run(() => {
      this.set('readOnly', true);

      Ember.run.next(() => {
        assert.equal($('.emberTagInput-tag').length, 2);
        assert.equal($('.emberTagInput-remove').length, 0);
        assert.equal($('.emberTagInput-new').length, 1);

        const $input = $('.emberTagInput-new input');
        assert.equal($input.length, 1);
        assert.ok($input.prop('disabled'));
        done();
      });
    });
  });
});
