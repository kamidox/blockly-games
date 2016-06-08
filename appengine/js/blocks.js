/**
 * Blockly Games: JavaScript Blocks
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
 * @fileoverview Blocks for Blockly's applications redefining exiting blocks
 * to have a look more similar to JavaScript.
 * @author fraser@google.com (Neil Fraser)
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('BlocklyGames.JSBlocks');

goog.require('Blockly');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');
goog.require('BlocklyGames.Msg');


// Extensions to Blockly's language and JavaScript generator.

/**
 * If/elseif/else condition.
 * @this Blockly.Block
 */
Blockly.Blocks['controls_if'].init = function() {
  this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
  this.setColour(Blockly.Blocks.logic.HUE);
  this.appendValueInput('IF0')
      .setCheck('Boolean')
      .appendField('if (');
  this.appendDummyInput()
      .appendField(') {');
  this.appendStatementInput('DO0');
  this.appendDummyInput('TAIL')
      .appendField('}');
  this.setInputsInline(true);
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setMutator(new Blockly.Mutator(['controls_if_elseif',
    'controls_if_else']));
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  this.setTooltip(function() {
    if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
      return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
    } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
      return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
    } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
      return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
    } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
      return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
    }
    return '';
  });
  this.elseifCount_ = 0;
  this.elseCount_ = 0;
};

/**
 * Modify this block to have the correct number of inputs.
 * @private
 * @this Blockly.Block
 */
Blockly.Blocks['controls_if'].updateShape_ = function() {
  // Delete everything.
  if (this.getInput('ELSE')) {
    this.removeInput('ELSEMSG');
    this.removeInput('ELSE');
  }
  var i = 1;
  while (this.getInput('IF' + i)) {
    this.removeInput('IF' + i);
    this.removeInput('TAIL' + i);
    this.removeInput('DO' + i);
    i++;
  }
  // Rebuild block.
  for (var i = 1; i <= this.elseifCount_; i++) {
    this.appendValueInput('IF' + i)
        .setCheck('Boolean')
        .appendField('} else if (');
    this.appendDummyInput('TAIL' + i)
        .appendField(') {');
    this.appendStatementInput('DO' + i);
  }
  if (this.elseCount_) {
    this.appendDummyInput('ELSEMSG')
        .appendField('} else {');
    this.appendStatementInput('ELSE');
  }
  // Move final '}' to the end.
  this.moveInputBefore('TAIL', null);
};

/**
 * Comparison operator.
 * @this Blockly.Block
 */
Blockly.Blocks['logic_compare'].init = function() {
  var OPERATORS = [
    ['==', 'EQ'],
    ['!=', 'NEQ'],
    ['<', 'LT'],
    ['<=', 'LTE'],
    ['>', 'GT'],
    ['>=', 'GTE']
  ];
  this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
  this.setColour(Blockly.Blocks.logic.HUE);
  this.setOutput(true, 'Boolean');
  this.appendValueInput('A');
  this.appendValueInput('B')
      .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
  this.setInputsInline(true);
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  this.setTooltip(function() {
    var op = thisBlock.getFieldValue('OP');
    var TOOLTIPS = {
      EQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
      NEQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
      LT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
      LTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
      GT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
      GTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
    };
    return TOOLTIPS[op];
  });
  this.prevBlocks_ = [null, null];
};

Blockly.Msg.LOGIC_OPERATION_AND = '&&';
Blockly.Msg.LOGIC_OPERATION_OR = '||';

Blockly.Msg.LOGIC_BOOLEAN_TRUE = 'true';
Blockly.Msg.LOGIC_BOOLEAN_FALSE = 'false';

/**
 * Do while/until loop.
 * @this Blockly.Block
 */
Blockly.Blocks['controls_whileUntil'].init = function() {
  this.jsonInit({
    "message0": "while ( %1 ) { %2 %3 }",
    "args0": [
      {
        "type": "input_value",
        "name": "BOOL",
        "check": "Boolean"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": Blockly.Blocks.loops.HUE,
    "tooltip": Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE,
    "helpUrl": Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL
  });
};

/**
 * Block for basic arithmetic operator.
 * @this Blockly.Block
 */
Blockly.Blocks['math_arithmetic'].init = function() {
  this.jsonInit({
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A",
        "check": "Number"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["+", "ADD"],
          ["-", "MINUS"],
          ["*", "MULTIPLY"],
          ["/", "DIVIDE"]
        ]
      },
      {
        "type": "input_value",
        "name": "B",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "output": "Number",
    "colour": Blockly.Blocks.math.HUE,
    "helpUrl": Blockly.Msg.MATH_ARITHMETIC_HELPURL
  });
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  this.setTooltip(function() {
    var mode = thisBlock.getFieldValue('OP');
    var TOOLTIPS = {
      'ADD': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
      'MINUS': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
      'MULTIPLY': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
      'DIVIDE': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE
    };
    return TOOLTIPS[mode];
  });
};

/**
 *  Add to a variable in place.
 * @this Blockly.Block
 */
Blockly.Blocks['math_change'].init = function() {
  this.jsonInit({
    "message0": "%1 += %2;",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "name"
      },
      {
        "type": "input_value",
        "name": "DELTA",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": Blockly.Blocks.math.HUE,
    "helpUrl": Blockly.Msg.MATH_CHANGE_HELPURL
  });
  // Assign 'this' to a variable for use in the tooltip closure below.
  var thisBlock = this;
  this.setTooltip(function() {
    return Blockly.Msg.MATH_CHANGE_TOOLTIP.replace('%1',
        thisBlock.getFieldValue('VAR'));
  });
};

Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM = 'Math.random()';

/**
 * Variable getter.
 * @this Blockly.Block
 */
Blockly.Blocks['variables_get'].init = function() {
  this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
  this.setColour(Blockly.Blocks.variables.HUE);
  this.appendDummyInput()
      .appendField(new Blockly.FieldVariable('name'), 'VAR');
  this.setOutput(true);
  this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
  this.contextMenuType_ = 'variables_set';
};

/**
 * Variable setter.
 * @this Blockly.Block
 */
Blockly.Blocks['variables_set'].init = function() {
  this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
  this.setColour(Blockly.Blocks.variables.HUE);
  this.appendValueInput('VALUE')
      .appendField('var')
      .appendField(new Blockly.FieldVariable('name'), 'VAR')
      .appendField('=');
  this.appendDummyInput()
      .appendField(';');
  this.setInputsInline(true);
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
  this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
  this.contextMenuType_ = 'variables_get';
};

/**
 * Define a procedure with no return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_defnoreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  var name = Blockly.Procedures.findLegalName(
      Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
  this.appendDummyInput()
      .appendField('function')
      .appendField(new Blockly.FieldTextInput(name,
          Blockly.Procedures.rename), 'NAME')
      .appendField('(')
      .appendField('', 'PARAMS')
      .appendField(') {');
  this.setStatements_(true);
  this.appendDummyInput()
      .appendField('}');
  this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
  this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
  this.arguments_ = [];
  this.statementConnection_ = null;
};

/**
 * Define a procedure with a return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_defreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  var name = Blockly.Procedures.findLegalName(
      Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
  this.appendDummyInput()
      .appendField('function')
      .appendField(new Blockly.FieldTextInput(name,
          Blockly.Procedures.rename), 'NAME')
      .appendField('(')
      .appendField('', 'PARAMS')
      .appendField(') {');
  this.appendValueInput('RETURN')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('return');
  this.appendDummyInput()
      .appendField('}');
  this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
  this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
  this.arguments_ = [];
  this.setStatements_(true);
  this.statementConnection_ = null;
};

Blockly.Msg.PROCEDURES_BEFORE_PARAMS = '';

/**
 * Call a procedure with no return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_callnoreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  this.appendDummyInput()
      .appendField('', 'NAME')
      .appendField('(');
  this.appendDummyInput('TAIL')
      .appendField(');');
  this.setInputsInline(true);
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setTooltip(Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP);
  this.arguments_ = [];
  this.quarkConnections_ = {};
  this.quarkArguments_ = null;
};

/**
 * Modify this block to have the correct number of arguments.
 * @private
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_callnoreturn'].updateShape_ = function() {
  for (var i = 0; i < this.arguments_.length; i++) {
    if (!this.getInput('ARG' + i)) {
      // Add new input.
      var field = new Blockly.FieldLabel(this.arguments_[i]);
      var input = this.appendValueInput('ARG' + i);
      if (i > 0) {
        input.appendField(',');
      }
      input.init();
    }
  }
  // Remove deleted inputs.
  while (this.getInput('ARG' + i)) {
    this.removeInput('ARG' + i);
    i++;
  }
  this.moveInputBefore('TAIL', null);
};

/**
 * Call a procedure with a return value.
 * @this Blockly.Block
 */
Blockly.Blocks['procedures_callreturn'].init = function() {
  this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
  this.setColour(Blockly.Blocks.procedures.HUE);
  this.appendDummyInput()
      .appendField('', 'NAME')
      .appendField('(');
  this.appendDummyInput('TAIL')
      .appendField(')');
  this.setInputsInline(true);
  this.setOutput(true);
  this.setTooltip(Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP);
  this.arguments_ = [];
  this.quarkConnections_ = {};
  this.quarkArguments_ = null;
};

Blockly.Blocks['procedures_callreturn'].updateShape_ =
    Blockly.Blocks['procedures_callnoreturn'].updateShape_;

// Don't show the "if/return" block.
delete Blockly.Blocks['procedures_ifreturn'];