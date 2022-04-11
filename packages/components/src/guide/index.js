/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState, useEffect, Children, useRef } from '@wordpress/element';
import deprecated from '@wordpress/deprecated';
import { __ } from '@wordpress/i18n';
import { LEFT, RIGHT } from '@wordpress/keycodes';
import { focus } from '@wordpress/dom';

/**
 * Internal dependencies
 */
import Modal from '../modal';
import Button from '../button';
import PageControl from './page-control';
import FinishButton from './finish-button';

export default function Guide( {
	children,
	className,
	contentLabel,
	finishButtonText,
	onFinish,
	pages = [],
} ) {
	const guideContainer = useRef();
	const [ currentPage, setCurrentPage ] = useState( 0 );

	useEffect( () => {
		if ( Children.count( children ) ) {
			deprecated( 'Passing children to <Guide>', {
				since: '5.5',
				alternative: 'the `pages` prop',
			} );
		}
	}, [ children ] );

	if ( Children.count( children ) ) {
		pages = Children.map( children, ( child ) => ( { content: child } ) );
	}

	const canGoBack = currentPage > 0;
	const canGoForward = currentPage < pages.length - 1;

	const goBack = () => {
		if ( canGoBack ) {
			setCurrentPage( currentPage - 1 );
		}
	};

	const goForward = () => {
		if ( canGoForward ) {
			setCurrentPage( currentPage + 1 );
		}
	};

	useEffect( () => {
		// Keeping the focus within the guide when the page changes
		// prevents the modal from closing and avoids focus loss.
		if (
			guideContainer.current.contains(
				guideContainer.current.ownerDocument.activeElement
			)
		) {
			return;
		}

		focus.tabbable.find( guideContainer.current )?.[ 0 ]?.focus();
	}, [ currentPage ] );

	if ( pages.length === 0 ) {
		return null;
	}

	return (
		<Modal
			className={ classnames( 'components-guide', className ) }
			contentLabel={ contentLabel }
			onRequestClose={ onFinish }
			onKeyDown={ ( event ) => {
				if ( event.keyCode === LEFT ) {
					goBack();
				} else if ( event.keyCode === RIGHT ) {
					goForward();
				}
			} }
		>
			<div className="components-guide__container" ref={ guideContainer }>
				<div className="components-guide__page">
					{ pages[ currentPage ].image }

					{ pages.length > 1 && (
						<PageControl
							currentPage={ currentPage }
							numberOfPages={ pages.length }
							setCurrentPage={ setCurrentPage }
						/>
					) }

					{ pages[ currentPage ].content }

					{ ! canGoForward && (
						<FinishButton
							className="components-guide__inline-finish-button"
							onClick={ onFinish }
						>
							{ finishButtonText || __( 'Finish' ) }
						</FinishButton>
					) }
				</div>

				<div className="components-guide__footer">
					{ canGoBack && (
						<Button
							className="components-guide__back-button"
							onClick={ goBack }
						>
							{ __( 'Previous' ) }
						</Button>
					) }
					{ canGoForward && (
						<Button
							className="components-guide__forward-button"
							onClick={ goForward }
						>
							{ __( 'Next' ) }
						</Button>
					) }
					{ ! canGoForward && (
						<FinishButton
							className="components-guide__finish-button"
							onClick={ onFinish }
						>
							{ finishButtonText || __( 'Finish' ) }
						</FinishButton>
					) }
				</div>
			</div>
		</Modal>
	);
}
