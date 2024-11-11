/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { FormPath, IFieldFactoryProps, IFieldProps, LifeCycleTypes } from '@formily/core';
import { Field } from '@formily/core/esm/models/Field';
import { JSXComponent, Schema } from '@formily/react';
import { batch, define, observable } from '@formily/reactive';
import { toArr } from '@formily/shared';

export function createNocoBaseField<Decorator extends JSXComponent, Component extends JSXComponent>(
  props: IFieldFactoryProps<Decorator, Component>,
): Field<Decorator, Component> {
  const address = FormPath.parse(props.basePath).concat(props.name);
  const identifier = address.toString();
  if (!identifier) return;
  if (!this.fields[identifier] || this.props.designable) {
    batch(() => {
      new NocoBaseReadPrettyField(address, props, this, this.props.designable);
    });
    this.notify(LifeCycleTypes.ON_FORM_GRAPH_CHANGE);
  }
  return this.fields[identifier] as any;
}

class NocoBaseReadPrettyField<
  Decorator extends JSXComponent = any,
  Component extends JSXComponent = any,
  TextType = any,
  ValueType = any,
> extends Field {
  declare props: IFieldProps<Decorator, Component, TextType, ValueType> & { schema: Schema };

  protected initialize() {
    this.initialized = false;
    this.loading = false;
    this.validating = false;
    this.submitting = false;
    this.selfModified = false;
    this.active = false;
    this.visited = false;
    this.mounted = false;
    this.unmounted = false;
    this.inputValues = [];
    this.inputValue = null;
    this.feedbacks = [];
    this.title = this.props.title || this.props.schema?.title;
    this.description = this.props.description || this.props.schema?.['description'];
    this.display = this.props.display || this.props.schema?.['x-display'];
    this.pattern = this.props.pattern || this.props.schema?.['x-pattern'];
    this.editable = this.props.editable || this.props.schema?.['x-editable'];
    this.disabled = this.props.disabled || this.props.schema?.['x-disabled'];
    this.readOnly = this.props.readOnly || this.props.schema?.['x-read-only'];
    this.readPretty = this.props.readPretty || this.props.schema?.['x-read-pretty'];
    this.visible = this.props.visible || this.props.schema?.['x-visible'];
    this.hidden = this.props.hidden || this.props.schema?.['x-hidden'];
    this.dataSource = this.props.dataSource || (this.props.schema?.enum as any);
    this.validator = this.props.validator;
    this.required = this.props.required || !!this.props.schema?.required;
    this.content = this.props.content || this.props.schema?.['x-content'];
    this.initialValue = this.props.initialValue || this.props.schema?.default;
    this.value = this.props.value;
    this.data = this.props.data || this.props.schema?.['x-data'];
    this.decorator = this.props.decorator
      ? toArr(this.props.decorator)
      : [this.props.schema?.['x-decorator'], this.props.schema?.['x-decorator-props']];
    this.component = this.props.component
      ? toArr(this.props.component)
      : [this.props.schema?.['x-component'], this.props.schema?.['x-component-props']];
  }

  protected makeObservable() {
    define(this, {
      componentProps: observable,
    });
  }

  // Set as an empty function to prevent parent class from executing this method
  protected makeReactive() {}
}
