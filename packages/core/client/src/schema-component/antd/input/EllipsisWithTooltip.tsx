/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Popover } from 'antd';
import React, { CSSProperties, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

const getContentWidth = (el: HTMLElement) => {
  if (el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const contentWidth = range.getBoundingClientRect().width;
    return contentWidth;
  }
};
const ellipsisDefaultStyle: CSSProperties = {
  overflow: 'hidden',
  overflowWrap: 'break-word',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  wordBreak: 'break-all',
};

const isOverflowTooltip = (el: HTMLElement) => {
  if (!el) return false;
  const contentWidth = getContentWidth(el);
  const offsetWidth = el.offsetWidth;
  return contentWidth > offsetWidth;
};

interface IEllipsisWithTooltipProps {
  ellipsis: boolean;
  popoverContent: unknown;
  children: any;
}

export const EllipsisWithTooltip = forwardRef((props: Partial<IEllipsisWithTooltipProps>, ref: any) => {
  const [ellipsis, setEllipsis] = useState(false);
  const [visible, setVisible] = useState(false);
  const elRef: any = useRef();
  useImperativeHandle(
    ref,
    () => {
      return {
        setPopoverVisible: setVisible,
      };
    },
    [],
  );

  const divContent = useMemo(
    () =>
      props.ellipsis ? (
        <div
          ref={elRef}
          style={ellipsisDefaultStyle}
          onMouseEnter={(e) => {
            const el = e.target as any;
            const isShowTooltips = isOverflowTooltip(elRef.current);
            if (isShowTooltips) {
              setEllipsis(el.scrollWidth >= el.clientWidth);
            }
          }}
        >
          {props.children}
        </div>
      ) : (
        props.children
      ),
    [props.children, props.ellipsis],
  );

  if (!props.ellipsis || !ellipsis) {
    return divContent;
  }

  return (
    <Popover
      open={ellipsis && visible}
      onOpenChange={(visible) => {
        setVisible(ellipsis && visible);
      }}
      content={
        <div
          style={{
            width: 300,
            overflow: 'auto',
            maxHeight: 400,
          }}
        >
          {props.popoverContent || props.children}
        </div>
      }
    >
      {divContent}
    </Popover>
  );
});
EllipsisWithTooltip.displayName = 'EllipsisWithTooltip';
