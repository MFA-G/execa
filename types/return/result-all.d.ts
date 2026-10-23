import type {IsObjectFd} from '../transform/object-mode.js';
import type {CommonOptions} from '../arguments/options.js';
import type {FdSpecificOption} from '../arguments/specific.js';
import type {IgnoresResultOutput} from './ignore.js';
import type {ResultStdio} from './result-stdout.js';

// `result.all`
export type ResultAll<OptionsType extends CommonOptions> = OptionsType extends unknown
	? ResultAllProperty<OptionsType['all'], OptionsType>
	: never;

type ResultAllProperty<
	AllOption extends CommonOptions['all'],
	OptionsType extends CommonOptions,
	BufferOption extends CommonOptions['buffer'] = OptionsType['buffer'],
> = AllOption extends true
	? BufferOption extends unknown
		? ResultAllBuffered<OptionsType, FdSpecificOption<BufferOption, '1'>, FdSpecificOption<BufferOption, '2'>>
		: never
	: undefined;

// Distribute buffer flags before selecting descriptors so their presence and output modes stay correlated.
type ResultAllBuffered<
	OptionsType extends CommonOptions,
	BufferStdout extends boolean | undefined,
	BufferStderr extends boolean | undefined,
> = BufferStdout extends unknown
	? BufferStderr extends unknown
		? ResultAllOutput<WithBufferFlags<OptionsType, BufferStdout, BufferStderr>>
		: never
	: never;

// With `exactOptionalPropertyTypes`, `Omit<OptionsType, ...>` is only accepted as `CommonOptions` behind a conditional (like `ScriptOptions`), and `buffer` cannot hold an explicit `undefined` flag, so that flag is left out instead.
type WithBufferFlags<
	OptionsType extends CommonOptions,
	BufferStdout extends boolean | undefined,
	BufferStderr extends boolean | undefined,
> = OptionsType extends CommonOptions
	? Omit<OptionsType, 'buffer'> & {buffer: BufferFlag<'stdout', BufferStdout> & BufferFlag<'stderr', BufferStderr>}
	: never;

type BufferFlag<Key extends string, Value extends boolean | undefined> = Value extends boolean
	? Record<Key, Value>
	: {};

type ResultAllOutput<OptionsType extends CommonOptions> = ResultStdio<
	AllMainFd<OptionsType>,
	AllObjectFd<OptionsType>,
	AllLinesFd<OptionsType>,
	OptionsType
>;

type AllMainFd<OptionsType extends CommonOptions> =
	IgnoresResultOutput<'1', OptionsType> extends true ? '2' : '1';

type AllObjectFd<OptionsType extends CommonOptions> =
	IgnoresResultOutput<'1', OptionsType> extends true ? '2'
		: IgnoresResultOutput<'2', OptionsType> extends true ? '1'
			: IsObjectFd<'1', OptionsType> extends true ? '1' : '2';

// `lines` is disabled by `buffer: false`, but still affects `all` when the descriptor has no stream.
type AllLinesFd<OptionsType extends CommonOptions> =
	FdSpecificOption<OptionsType['buffer'], '1'> extends false ? '2'
		: FdSpecificOption<OptionsType['buffer'], '2'> extends false ? '1'
			: FdSpecificOption<OptionsType['lines'], '1'> extends true ? '1' : '2';

export {};
