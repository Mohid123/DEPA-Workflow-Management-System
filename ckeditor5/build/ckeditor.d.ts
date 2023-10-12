/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Autosave } from '@ckeditor/ckeditor5-autosave';
import { Bold, Code, Italic, Strikethrough, Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Heading, Title } from '@ckeditor/ckeditor5-heading';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { DataFilter, DataSchema, GeneralHtmlSupport, HtmlComment } from '@ckeditor/ckeditor5-html-support';
import { AutoImage, Image, ImageCaption, ImageInsert, ImageResize, ImageStyle, ImageToolbar, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List, TodoList } from '@ckeditor/ckeditor5-list';
import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { SelectAll } from '@ckeditor/ckeditor5-select-all';
import { SpecialCharacters } from '@ckeditor/ckeditor5-special-characters';
import { Table, TableCaption, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { EditorWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { WordCount } from '@ckeditor/ckeditor5-word-count';
declare class Editor extends ClassicEditor {
    static builtinPlugins: (typeof Alignment | typeof AutoImage | typeof AutoLink | typeof Autoformat | typeof Autosave | typeof BlockQuote | typeof Bold | typeof CloudServices | typeof Code | typeof CodeBlock | typeof DataFilter | typeof DataSchema | typeof Essentials | typeof FindAndReplace | typeof FontBackgroundColor | typeof FontColor | typeof FontFamily | typeof FontSize | typeof GeneralHtmlSupport | typeof Heading | typeof Highlight | typeof HorizontalLine | typeof HtmlComment | typeof HtmlEmbed | typeof Image | typeof ImageCaption | typeof ImageInsert | typeof ImageResize | typeof ImageStyle | typeof ImageToolbar | typeof ImageUpload | typeof Indent | typeof IndentBlock | typeof Italic | typeof Link | typeof LinkImage | typeof List | typeof Markdown | typeof MediaEmbed | typeof Mention | typeof Paragraph | typeof PasteFromOffice | typeof SelectAll | typeof SpecialCharacters | typeof Strikethrough | typeof Subscript | typeof Superscript | typeof Table | typeof TableCaption | typeof TableToolbar | typeof TextTransformation | typeof Title | typeof TodoList | typeof WordCount)[];
    static defaultConfig: {
        toolbar: {
            items: string[];
        };
        language: string;
        image: {
            toolbar: string[];
        };
        table: {
            contentToolbar: string[];
        };
    };
}
declare const _default: {
    Editor: typeof Editor;
    EditorWatchdog: typeof EditorWatchdog;
};
export default _default;
