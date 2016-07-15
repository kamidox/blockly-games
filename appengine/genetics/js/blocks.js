/**
 * Blockly Games: Genetics Blocks
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for Blockly's Genetics application.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('BlocklyGames');
goog.require('BlocklyGames.JSBlocks');

/**
 * HSV hue for all genetics mouse function blocks.
 */
Genetics.Blocks.GENETICS_MOUSEFUNCTIONS_HUE = 360; // TODO(kozbial) update template to use this constant
/**
 * HSV hue for all genetics blocks (that are not mouse functions).
 */
Genetics.Blocks.GENETICS_HUE = 20;

// Extensions to Blockly's language and JavaScript generator.

/**
 * Helper function shared between mouse functions that defines the JavScript
 * generation function.
 * @param {string} funcName The name of the mouse function.
 * @param {string} args A comma separated string of mouse function arguments.
 * @param {!Blockly.Block} block The block.
 * @return {Function}
 * @private
 */
Blockly.JavaScript['genetics_mouseFunction_'] = function(funcName, args,
    block) {
  // Define a procedure with a return value.
  var branch = Blockly.JavaScript.statementToCode(block, 'STACK');
  if (Blockly.JavaScript.STATEMENT_PREFIX) {
    branch = Blockly.JavaScript.prefixLines(
            Blockly.JavaScript.STATEMENT_PREFIX.replace(/%1/g,
                '\'' + block.id + '\''), Blockly.JavaScript.INDENT) + branch;
  }
  if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
            '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.JavaScript.valueToCode(block, 'RETURN',
          Blockly.JavaScript.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var code = 'function ' + funcName + '(' + args + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.JavaScript.scrub_(block, code);
  Blockly.JavaScript.definitions_[funcName] = code;
  return null;
};

/**
 * Helper function shared between mouse functions that generates the jsonInit
 * function which defines the Blocks.
 * @param {string} funcName The name of the mouse function.
 * @param {string} args A comma separated string of mouse function arguments.
 * @param {string} returnType The return type of the mouse function.
 * @this Blockly.Block
 * @private
 */
Blockly.Blocks['genetics_mouseFunctionInit_'] = function(funcName, args,
    returnType) {
  this.jsonInit({
    "message0": "function %1( " + args + " ) { %2 %3 return %4 }",
    "args0": [
      {
        "type": "field_label",
        "name": "NAME",
        "text": funcName
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "STACK"
      },
      {
        "type": "input_value",
        "check": returnType,
        "align": "right",
        "name": "RETURN"
      }
    ],
    "inputsInline": true,
    "colour": Genetics.Blocks.GENETICS_MOUSEFUNCTIONS_HUE,
    "tooltip": BlocklyGames.getMsg('Genetics_' + funcName + 'Tooltip')
  });
};

/**
 * Block for defining mouse decision on which other mouse to fight.
 * @type {{init: !Function}}
 */
Blockly.Blocks['genetics_pickFight'] = {
  init: goog.partial(Blockly.Blocks['genetics_mouseFunctionInit_'],
                     'pickFight', '', 'Mouse')
};

/**
 * Defines the JavaScript generation for pickFight.
 * @type {!Function}
 */
Blockly.JavaScript['genetics_pickFight'] =
    goog.partial(Blockly.JavaScript['genetics_mouseFunction_'],
                 'pickFight', '');
/**
 * Block for defining mouse decision on which other mouse to mate with.
 * @type {{init: !Function}}
 */
Blockly.Blocks['genetics_chooseMate'] = {
  init: goog.partial(Blockly.Blocks['genetics_mouseFunctionInit_'],
                     'chooseMate', '', 'Mouse')
};

/**
 * Defines the JavaScript generation for chooseMate.
 * @type {!Function}
 */
Blockly.JavaScript['genetics_chooseMate'] =
    goog.partial(Blockly.JavaScript['genetics_mouseFunction_'],
                 'chooseMate', '');
/**
 * Block for defining mouse decision on whether to mate with a specific mouse.
 * @type {{init: !Function}}
 */
Blockly.Blocks['genetics_mateAnswer'] = {
  init: goog.partial(Blockly.Blocks['genetics_mouseFunctionInit_'],
                     'mateAnswer', 'suitor', 'Boolean'),
  getVars: function() {
    return ['suitor'];
  }
};

/**
 * Defines the JavaScript generation for mateAnswer.
 * @type {!Function}
 */
Blockly.JavaScript['genetics_mateAnswer'] =
    goog.partial(Blockly.JavaScript['genetics_mouseFunction_'],
                 'mateAnswer', 'suitor');

Blockly.Blocks['genetics_getSelf'] = {
  /**
   * Block for getting the mouse making the decision.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "getSelf ()",
      "output": "Mouse",
      "colour": Genetics.Blocks.GENETICS_HUE,
      "tooltip": BlocklyGames.getMsg('Genetics_meTooltip')
    });
  }
};

/**
 * Defines the JavaScript generation for getSelf.
 * @param {Blockly.Block} block
 * @return {!Array.<string|number>}
 */
Blockly.JavaScript['genetics_getSelf'] = function(block) {
  // Generate JavaScript for mouse making the decision.
  return ['me()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['genetics_getMice'] = {
  /**
   * Block for getting all mice in the cage.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "getMice ()",
      "output": "Array",
      "colour": Genetics.Blocks.GENETICS_HUE,
      "tooltip": BlocklyGames.getMsg('Genetics_getMiceTooltip')
    });
  }
};

/**
 * Defines the JavaScript generation for getMice.
 * @param {Blockly.Block} block
 * @return {!Array.<string|number>}
 */
Blockly.JavaScript['genetics_getMice'] = function(block) {
  // Generate JavaScript for getting mice.
  return ['getMice()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * Block for getting the properties of a mouse.
 * @this Blockly.Block
 */
Blockly.Blocks['genetics_getProperties'] = {
  /**
   * Block for getting mouse properties
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1.%2",

      "args0": [
        {
          "type": "input_value",
          "name": "MOUSE",
          "check": "Mouse"
        },
        {
          "type": "field_dropdown",
          "name": "PROPERTY",
          "options": [
            ['size', 'SIZE'],
            ['aggressiveness', 'AGGRESSIVENESS'],
            ['startAggressiveness', 'START_AGGRESSIVENESS'],
            ['fertility', 'FERTILITY'],
            ['startingFertility', 'START_FERTILITY'],
            ['age', 'AGE'],
            ['id', 'ID'],
            ['pickFightOwner', 'PICK_FIGHT'],
            ['chooseMateOwner', 'CHOOSE_MATE'],
            ['mateAnswerOwner', 'MATE_ANSWER']
          ]
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Genetics.Blocks.GENETICS_HUE
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('PROPERTY');
      var TOOLTIPS = {
        'SIZE': BlocklyGames.getMsg('Genetics_sizeTooltip'),
        'AGGRESSIVENESS': BlocklyGames.getMsg('Genetics_aggressivenessTooltip'),
        'FERTILITY': BlocklyGames.getMsg('Genetics_fertilityTooltip'),
        'START_FERTILITY': BlocklyGames.getMsg('Genetics_startFertilityTooltip'),
        'AGE': BlocklyGames.getMsg('Genetics_ageTooltip'),
        'ID': BlocklyGames.getMsg('Genetics_idTooltip'),
        'PICK_FIGHT': BlocklyGames.getMsg('Genetics_pickFightOwnerTooltip'),
        'CHOOSE_MATE': BlocklyGames.getMsg('Genetics_chooseMateOwnerTooltip'),
        'MATE_ANSWER': BlocklyGames.getMsg('Genetics_mateAnswerOwnerTooltip')
      };
      return TOOLTIPS[mode];
    });
  },
  /**
   * Modify this block to have the correct output type.
   * @param {string} newProp Either a property requesting a function owner that
   * returns a string or a property that returns a number.
   * @private
   * @this Blockly.Block
   */
  updateType_: function(newProp) {
    if (newProp == 'PICK_FIGHT' || newProp == 'CHOOSE_MATE' ||
        newProp == 'MATE_ANSWER') {
      this.outputConnection.setCheck('String');
    } else {
      this.outputConnection.setCheck('Number');
    }
  }
};

/**
 * Defines the JavaScript generation for getProperties.
 * @param {Blockly.Block} block
 * @return {!Array.<string|number>}
 */
Blockly.JavaScript['genetics_getProperties'] = function(block) {
  // Generate JavaScript for getting mouse property.
  var mouse = Blockly.JavaScript.valueToCode(block, 'MOUSE',
          Blockly.JavaScript.ORDER_NONE) || 'me()';
  var property = block.getFieldValue('PROPERTY');
  var code = mouse + '.';
  switch (property) {
    case 'SIZE':
      code += 'size';
      break;
    case 'AGGRESSIVENESS':
      code += 'aggressiveness';
      break;
    case 'START_AGGRESSIVENESS':
      code += 'aggressiveness';
      break;
    case 'FERTILITY':
      code += 'fertility';
      break;
    case 'START_FERTILITY':
      code += 'startFertility';
      break;
    case 'AGE':
      code += 'age';
      break;
    case 'ID':
      code += 'id';
      break;
    case 'PICK_FIGHT':
      code += 'pickFightOwner';
      break;
    case 'CHOOSE_MATE':
      code += 'chooseMateOwner';
      break;
    case 'MATE_ANSWER':
      code += 'mateAnswerOwner';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Blocks['genetics_math_randomInt'] = {
  /**
   * Retrieves a random integer value between two numbers inclusive.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "Math.randomInt(%1, %2)",
      "args0": [
        {
          "type": "input_value",
          "name": "MIN_VALUE",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "MAX_VALUE",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_RANDOM_INT_HELPURL,
      "tooltip": Blockly.Msg.MATH_RANDOM_INT_TOOLTIP
    });
  }
};

Blockly.JavaScript['genetics_math_randomInt'] = function(block) {
  // Retrieves a random integer value between two numbers, inclusive.
  var minValue = Blockly.JavaScript.valueToCode(block, 'NUM',
          Blockly.JavaScript.ORDER_COMMA) || '0';
  var maxValue = Blockly.JavaScript.valueToCode(block, 'NUM',
          Blockly.JavaScript.ORDER_COMMA) || '0';
  var code = 'Math.randomInt(' + minValue + ', ' + maxValue + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};