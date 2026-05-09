<?php
/**
 * The template for displaying comments
 *
 * This is the template that displays the area of the page that contains both the current comments
 * and the comment form.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Web_Whales_Base_Theme
 */

/*
 * If the current post is protected by a password and
 * the visitor has not yet entered the password we will
 * return early without loading the comments.
 */
if ( post_password_required() ) {
	return;
}
?>

<div id="comments" class="comments-area">

	<?php if ( have_comments() ) : ?>
		<h2 class="comments-title">
			<?php
				$base_theme_comment_count = (int) get_comments_number();

				if ( $base_theme_comment_count === 1 ) {
					printf(
						/* translators: 1: title. */
						baseTheme()->esc_html__( 'One thought on &ldquo;%1$s&rdquo;' ),
						'<span>' . get_the_title() . '</span>'
					);
				} else {
					printf( // WPCS: XSS OK.
						/* translators: 1: comment count number, 2: title. */
						esc_html( baseTheme()->_nx( '%1$s thought on &ldquo;%2$s&rdquo;', '%1$s thoughts on &ldquo;%2$s&rdquo;', $base_theme_comment_count, 'comments title' ) ),
						number_format_i18n( $base_theme_comment_count ),
						'<span>' . get_the_title() . '</span>'
					);
				}
			?>
		</h2>

		<?php the_comments_navigation(); ?>

		<ol class="comment-list">
			<?php
				wp_list_comments( [
					'style'      => 'ol',
					'short_ping' => true,
				] );
			?>
		</ol>

		<?php the_comments_navigation(); ?>

		<?php // If comments are closed and there are comments, let's leave a little note, shall we? ?>
		<?php if ( ! comments_open() ) : ?>
			<p class="no-comments"><?php echo baseTheme()->esc_html__( 'Comments are closed.' ); ?></p>
		<?php endif; ?>
	<?php endif; ?>

	<?php comment_form(); ?>
</div><!-- #comments -->