<?php
	global $product;

	print '<div class="woocommerce-product-details__additional mt-5">';
		$additionDescriptionClasses = [ 'additional-description', 'col-lg-7' ];
		$additionInformationClasses = [ 'additional-information', 'col-lg-5' ];

		if ( ! empty( $product->get_attributes() ) ) {
			$additionDescriptionClasses[] = 'col-lg-7';
		} else {
			$additionDescriptionClasses[] = 'col-lg-12';
		}

		print '<div class="' . esc_attr( implode( ' ', $additionDescriptionClasses ) ) . '">';
			if ( get_the_content() ) :
				woocommerce_product_description_tab();
			else:
				print '<BR>';
			endif;
		print '</div>';

		if ( ! empty( $product->get_attributes() ) ) :
			print '<div class="' . esc_attr( implode( ' ', $additionInformationClasses ) ) . '">';
			woocommerce_product_additional_information_tab();
			print '</div>';
		endif;
	print '</div>';