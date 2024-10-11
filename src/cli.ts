import { cli } from 'cleye';

import aicommit2 from './commands/aicommit2.js';
import configCommand from './commands/config.js';
import hookCommand, { isCalledFromGitHook } from './commands/hook.js';
import logCommand from './commands/log.js';
import prepareCommitMessageHook from './commands/prepare-commit-msg-hook.js';
import watchGit from './commands/watch-git.js';
import { description, version } from '../package.json';

const rawArgv = process.argv.slice(2);

cli(
    {
        name: 'aicommit2',
        version,
        /**
         * Since this is a wrapper around `git commit`,
         * flags should not overlap with it
         * https://git-scm.com/docs/git-commit
         */
        flags: {
            locale: {
                type: String,
                description: 'Locale to use for the generated commit messages (default: en)',
                alias: 'l',
            },
            generate: {
                type: Number,
                description: 'Number of messages to generate (Warning: generating multiple costs more) (default: 1)',
                alias: 'g',
            },
            exclude: {
                type: [String],
                description: 'Files to exclude from AI analysis',
                alias: 'x',
            },
            all: {
                type: Boolean,
                description: 'Automatically stage changes in tracked files for the commit',
                alias: 'a',
                default: false,
            },
            type: {
                type: String,
                description: 'Type of commit message to generate',
                alias: 't',
            },
            confirm: {
                type: Boolean,
                description: 'Skip confirmation when committing after message generation (default: false)',
                alias: 'y',
                default: false,
            },
            clipboard: {
                type: Boolean,
                description: 'Copy the selected message to the clipboard',
                alias: 'c',
                default: false,
            },
            prompt: {
                type: String,
                description: 'Custom prompt to let users fine-tune provided prompt',
                alias: 'p',
            },
            watch: {
                type: Boolean,
                default: false,
            },
        },

        commands: [configCommand, hookCommand, logCommand],

        help: {
            description,
        },

        ignoreArgv: type => type === 'unknown-flag' || type === 'argument',
    },
    argv => {
        if (isCalledFromGitHook) {
            prepareCommitMessageHook();
            return;
        }
        if (argv.flags.watch) {
            watchGit(argv.flags.locale, argv.flags.generate, argv.flags.exclude, argv.flags.prompt, rawArgv);
            return;
        }
        aicommit2(
            argv.flags.locale,
            argv.flags.generate,
            argv.flags.exclude,
            argv.flags.all,
            argv.flags.type,
            argv.flags.confirm,
            argv.flags.clipboard,
            argv.flags.prompt,
            rawArgv
        );
    },
    rawArgv
);
