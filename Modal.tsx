import {Heading} from 'components/editable';
import {EventEmitter} from 'components/events';
import {Button} from 'components/form';
import {CloseButton} from 'components/ui';
import React from 'react';
// @ts-ignore
import {default as ReactModal} from 'react-modal';
import './Modal.scss';

import * as Types from 'components/types';

ReactModal.defaultStyles = {
	overlay: {},
	content: {},
};

export type ModalProps = {
	doCloseOthersOnOpen?: boolean;
	useHash?: boolean;
	isDismissable?: boolean;
	isActive?: boolean;
	children?: Types.Children;
	closeText?: string;
	theme?: string;
	closeTimeout?: number;
	hasChrome?: boolean;
	header?: any; // PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	id?: string;
	isDynamic?: boolean;
	openClass?: string;
	openText?: string;
	openTimeout?: number;
	position?: string;
	size?: string;
	title?: string;
	onAfterOpen?: any; // function
	onClose?: any; // function

	headerAfter?: any;
};

type ModalState = {
	isActive?: boolean;
};

export class Modal extends React.Component<ModalProps, ModalState> {
	static defaultProps = {
		theme: 'default',
		useHash: false,
		isDismissable: true,
		doCloseOthersOnOpen: false,
		isActive: false,
		id: '',
		isDynamic: true,
		closeText: 'Close',
		openText: '',
		openClass: '',
		size: 'default',
		position: 'right',
		title: '',
		header: '',
		hasChrome: true,
		children: '',
		closeTimeout: 650,
		openTimeout: 650,
		onClose: null,
		onAfterOpen: null,
	};

	base: string = 'popup';
	modalClass: string = 'modal';
	modalElement: any = null;
	modalContent: any = null;
	onRequestClose: any;
	onRequestOpen: any;
	modal: any;
	container: any;

	state: ModalState;

	constructor(props: ModalProps) {
		super(props);

		//this.base = 'popup';
		//this.modalClass = 'modal';

		this.state = {
			isActive: props.isActive,
		};

		//this.modalElement = null;
		//this.modalContent = null;

		this.onRequestClose = this.close.bind(this);
		this.onRequestOpen = this.open.bind(this);
	}

	onHashChange = (ev: any) => {
		this.hashCheck(ev.target.location.hash);
	};

	hashCheck(hash: string, anchor = false) {
		const {id} = this.props;

		if (!id) {
			return null;
		}

		if (hash) {
			const windowId = hash.substr(1);

			if (windowId === id) {
				this.open();
			}
		}
	}

	componentDidMount() {
		const {id} = this.props;

		if (id) {
			EventEmitter.subscribe(`modal[${id}]-close`, this.onRequestClose);
		}

		EventEmitter.subscribe(`modal-close-all`, this.onRequestClose);

		const {useHash} = this.props;

		this.hashCheck(window.location.hash, true);

		if (useHash) {
			window.addEventListener('hashchange', this.onHashChange, false);
		}
	}

	conponentWillUnmount() {
		const {useHash} = this.props;
		if (useHash) {
			window.removeEventListener('hashchange', this.onHashChange);
		}
	}

	onModalClick = (e: any) => {
		if (e.target === this.modal) {
			this.close();
		}
	};

	onAfterOpen = () => {
		const {onAfterOpen} = this.props;

		if (onAfterOpen) {
			onAfterOpen.call();
		}
	};

	componentWillReceiveProps(nextProps: ModalProps) {
		const {isActive} = this.state;

		if (nextProps.isActive && isActive === false) {
			this.open();
		} else if (nextProps.isActive === false && isActive) {
			this.close();
		} else {
			this.setState(nextProps);
		}
	}

	close() {
		setTimeout(() => {
			document.body.style.width = '100%';
		}, 310);

		const {isActive} = this.state;

		if (isActive === false) {
			return;
		}

		this.setState(
			{
				isActive: false,
			},
			() => {
				const {onClose, id, useHash} = this.props;

				EventEmitter.dispatch(`modal[${id}]-closed`);

				if (onClose) {
					onClose.call();
				}

				if (useHash) {
					window.location.hash = '';
				}
			}
		);
	}

	open() {
		const body = document.body;
		const scrollWidth = window.innerWidth - body.offsetWidth;
		body.style.width = `calc(100% - ${scrollWidth}px)`;

		const {isActive} = this.state;

		if (isActive === true) {
			return;
		}

		const {doCloseOthersOnOpen} = this.props;

		if (doCloseOthersOnOpen) {
			EventEmitter.dispatch(`modal-close-all`);
		}

		this.setState({isActive: true}, () => {});
	}

	getClose() {
		const {closeText, isDismissable} = this.props;

		if (!isDismissable) {
			return null;
		}

		return <CloseButton className={'modal__close'} onClick={this.onRequestClose} title={closeText} />;
	}

	getInner() {
		const {hasChrome, headerAfter, theme} = this.props;

		const header = this.getTitle();
		const head =
			typeof header === 'string' ? (
				<Heading priority={3} title={header} className={`${this.modalClass}__title`} />
			) : (
				header
			);

		if (hasChrome) {
			return (
				<div className={`${this.modalClass}__chrome`} data-theme={theme}>
					<div className={`${this.modalClass}__head`}>
						<div className={`${this.modalClass}__head-inner`}>
							<div className={`${this.modalClass}__head-title`}>{head}</div>
							{this.getClose()}
							{headerAfter}
						</div>
					</div>
					<div className={`${this.modalClass}__body`}>
						<div ref={container => (this.container = container)}>{this.getContent()}</div>
					</div>
				</div>
			);
		}

		return (
			<div>
				<div ref={container => (this.container = container)}>{this.getContent()}</div>
				{this.getClose()}
			</div>
		);
	}

	getContent() {
		const {children} = this.props;

		return children;
	}

	getTitle() {
		const {title, header} = this.props;

		if (header === '') {
			return title;
		}

		return header;
	}

	render() {
		const {
			id,
			isDismissable,
			isDynamic,
			openTimeout,
			closeTimeout,
			position,
			hasChrome,
			size,
			openText,
			title,
		} = this.props;

		const {isActive} = this.state;

		const overlayClass = {
			base: `${this.modalClass} ${this.modalClass}--${id ? id : 'generic'} ${this.modalClass}--${
				hasChrome ? 'chrome' : 'chromeless'
			} ${this.modalClass}--${position} ${this.modalClass}--${size}`,
			afterOpen: `active ${this.modalClass}--after-open`,
			beforeClose: `${this.modalClass}--before-close`,
		};

		const wrapperClass = {
			base: `${this.modalClass}__content`,
			afterOpen: `${this.modalClass}__content-after-open`,
			beforeClose: `${this.modalClass}__content-before-close`,
		};

		return (
			<div className={`${this.base}`}>
				{openText && (
					<div className={`${this.base}__open`}>
						<Button priority="primary" label={openText} onClick={this.onRequestOpen} />
					</div>
				)}
				{isDynamic ? (
					<ReactModal
						isOpen={isActive}
						onAfterOpen={this.onAfterOpen}
						onRequestClose={isDismissable ? this.onRequestClose : null}
						contentLabel={title}
						openTimeoutMS={openTimeout}
						closeTimeoutMS={closeTimeout}
						className={wrapperClass}
						overlayClassName={overlayClass}
						bodyOpenClassName={`${this.modalClass}-open`}
						ariaHideApp={false}
					>
						{this.getInner()}
					</ReactModal>
				) : (
					<div
						className={`${overlayClass.base} ${this.modalClass}--placeholder ${
							isActive ? overlayClass.afterOpen : ''
						}`}
						onClick={this.onModalClick}
						ref={modal => (this.modal = modal)}
					>
						<div className={wrapperClass.base}>{this.getInner()}</div>
					</div>
				)}
			</div>
		);
	}
}
