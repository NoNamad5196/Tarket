import { Component, type ReactNode } from 'react'

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }

  render() {
    if (this.state.failed) return <main className="app-shell error-page page" role="alert">
      <span className="eyebrow">TARKET CINEMA</span>
      <h1 className="font-serif-kr">무대를 다시 준비하고 있어요.</h1>
      <p>화면을 불러오지 못했어요. 새로 입장해주세요.</p>
      <p>새로 입장하면 입력한 정보는 지워집니다.</p>
      <button className="button primary" style={{ marginTop: 24 }} onClick={() => window.location.reload()}>다시 입장하기</button>
    </main>
    return this.props.children
  }
}
