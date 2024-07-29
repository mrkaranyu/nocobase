/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Database, Model } from '@nocobase/database';
import _ from 'lodash';

export const syncJSONCollection = (db: Database) => {
  return async (model: Model, { transaction }) => {
    const { type, key, fields = [] } = model.get();
    if (type !== 'JSONDocument') {
      return;
    }
    model.set('options', _.omit(model.get('options'), ['fields']));
    const target = `${key}_json_collection`;
    const targetKey = '__json_index';
    const repo = db.getRepository('collections');
    let targetModel = await repo.findOne({
      filterByTk: target,
      transaction,
    });
    if (!targetModel) {
      fields.push({
        interface: 'id',
        title: 'Index',
        type: 'bigInt',
        name: targetKey,
        uiSchema: {
          type: 'number',
          title: '{{t("Index")}}',
          'x-component': 'InputNumber',
          'x-read-pretty': true,
        },
      });
      const collectionRepo = db.getRepository('collections');
      targetModel = await collectionRepo.create({
        values: {
          title: target,
          name: target,
          json: true,
          sync: false,
          hidden: true,
          fields,
          filterTargetKey: targetKey,
        },
        transaction,
      });
      await targetModel.load({ transaction });
      model.set('options', Object.assign(model.get('options'), { target, targetKey }));
      return;
    }
    const existFields = await targetModel.getFields({ transaction });
    const deletedFields = existFields.filter(
      (field: any) => field.name !== targetKey && !fields.find((f: any) => f.name === field.name),
    );
    for (const field of deletedFields) {
      await field.destroy({ transaction });
    }
    [targetModel] = await repo.update({
      filterByTk: target,
      values: {
        fields,
      },
      updateAssociationValues: ['fields'],
      transaction,
    });
    await targetModel.load({ transaction });
  };
};
