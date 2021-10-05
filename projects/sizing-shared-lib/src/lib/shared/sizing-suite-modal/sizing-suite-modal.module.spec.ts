import { SizingSuiteModalModule } from './sizing-suite-modal.module';

describe('ModalModule', () => {
  let modalModule: SizingSuiteModalModule;

  beforeEach(() => {
    modalModule = new SizingSuiteModalModule();
  });

  it('should create an instance', () => {
    expect(modalModule).toBeTruthy();
  });
});
