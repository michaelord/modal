import * as React from 'react';

import './Modal.scss';

import {getModifiers} from 'components/libs';

type ModalProps = {
	children: React.ReactNode;
};

export const Modal = (props: ModalProps) => {
	const {children} = props;

	if (!children || React.Children.count(children) === 0) {
		return null;
	}

	const base: string = 'modal';

	const atts: object = {
		className: getModifiers(base, {}),
	};

	return <div {...atts}>{children}</div>;
};
