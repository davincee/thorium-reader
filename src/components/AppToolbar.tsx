import * as React from "react";
import { Store } from "redux";

import DropDownMenu from "material-ui/DropDownMenu";
import FontIcon from "material-ui/FontIcon";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import { blue500 } from "material-ui/styles/colors";
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from "material-ui/Toolbar";
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import { setLocale } from "../actions/i18n";
import { lazyInject } from "../di";
import { IAppState } from "../reducers/app";
import { Translator } from "../i18n/translator";

var fs = require('fs');
var commonmark = require('commonmark');

interface AppToolbarState {
    locale: string;
    open: boolean;
    dialogContent: string;
}

const styles = {
    fileInput: {
        bottom: 0,
        cursor: "pointer",
        left: 0,
        opacity: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: "100%",
        zIndex: 100,
    },
    iconButton: {
        margin: 12,
    },
};

export default class AppToolbar extends React.Component<undefined, AppToolbarState> {
    public state: AppToolbarState;

    @lazyInject("store")
    private store: Store<IAppState>;

    @lazyInject(Translator)
    private translator: Translator;

    constructor() {
        super();
        this.state = {
            locale: this.store.getState().i18n.locale,
            open: false,
            dialogContent: undefined
        };

        this.handleLocaleChange = this.handleLocaleChange.bind(this);
    }

    public componentDidMount() {
        this.store.subscribe(() => {
            this.setState({
                locale: this.store.getState().i18n.locale,
            });
        });
    }

    public render(): React.ReactElement<{}>  {
        const __ = this.translator.translate;
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleClose}
            />
        ];

        var that = this;
        var helpUrl = "./src/resources/docs/" + this.state.locale + "/help.md";
        var aboutUrl = "./src/resources/docs/" + this.state.locale + "/about.md";

        return (

            <div>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <DropDownMenu value={this.state.locale} onChange={this.handleLocaleChange}>
                            <MenuItem value="en" primaryText="English" />
                            <MenuItem value="fr" primaryText="French" />
                        </DropDownMenu>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <ToolbarTitle text="Options" />
                        <FontIcon className="muidocs-icon-custom-sort" />
                        <ToolbarSeparator />
                        <IconButton touch={true}>
                            <FontIcon
                                className="fa fa-plus-circle"
                                style={styles.iconButton}
                                color={blue500}>
                                <input type="file" style={styles.fileInput} />
                            </FontIcon>
                        </IconButton>
                        <IconMenu
                            iconButtonElement={
                                <IconButton touch={true}>
                                    <FontIcon
                                        className="fa fa-ellipsis-v"
                                        style={styles.iconButton}
                                        color={blue500} />
                                </IconButton>
                            }
                        >
                            <MenuItem primaryText= {__("toolbar.help")} onClick={function(){that.handleOpen(helpUrl)}} leftIcon={<FontIcon className="fa fa-question-circle" color={blue500} />} />
                            <MenuItem primaryText={__("toolbar.news")} onClick={function(){that.handleOpen(aboutUrl)}} leftIcon={<FontIcon className="fa fa-gift" color={blue500} />} />
                            <MenuItem primaryText={__("toolbar.sync")} leftIcon={<FontIcon className="fa fa-refresh" color={blue500} />} />
                        </IconMenu>
                    </ToolbarGroup>
                </Toolbar>

                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    >
                    <div dangerouslySetInnerHTML={{__html: this.state.dialogContent}} />
                </Dialog>
            </div>
        );
    }

    handleOpen = (url:string) => {
        var content = fs.readFileSync(url).toString()
        var reader = new commonmark.Parser();
        var writer = new commonmark.HtmlRenderer();

        var parsed = reader.parse(content);
        var result = writer.render(parsed);
        this.setState({open: true});
        this.setState({dialogContent : result});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    private handleLocaleChange(event: any, index: any, locale: string) {
        this.store.dispatch(setLocale(locale));
    }
}
