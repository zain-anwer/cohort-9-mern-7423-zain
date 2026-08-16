import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

jest.mock('../src/utils/axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}))

describe('App Component', () => {
    it('should render without crashing', () => {
        <MemoryRouter>
            render(<App/>)
        </MemoryRouter>
    })
})