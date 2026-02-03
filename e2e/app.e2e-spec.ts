import { IcomTemplatePage } from './app.po';

describe('Icom App', function () {
    let page: IcomTemplatePage;

    beforeEach(() => {
        page = new IcomTemplatePage();
    });

    it('should display message saying app works', () => {
        page.navigateTo();
        expect(page.getParagraphText()).toEqual('app works!');
    });
});
