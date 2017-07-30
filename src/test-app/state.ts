import LiteMol from 'litemol'
import Rx = LiteMol.Core.Rx

interface State {
    queryString: string,
    fullPlugin: LiteMol.Plugin.Controller,
    resultPlugin: LiteMol.Plugin.Controller,
    formattedQuery: Rx.Subject<string>
}

function State(): State {
    return { queryString: '', fullPlugin: void 0 as any, resultPlugin: void 0 as any, formattedQuery: new Rx.Subject() }
}

export default State